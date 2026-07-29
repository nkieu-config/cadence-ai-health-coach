import { chromium, devices, type Browser, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.SHOTS_BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.DEMO_EMAIL ?? "qa-bot@example.com";
const PASSWORD = process.env.DEMO_PASSWORD ?? "qabotcadence123";
const OUT = process.env.SHOTS_OUT ?? "docs/assets/readme";

// anchor = เลื่อนหน้าไปหาข้อความ · anchorSelector = เลื่อน "กล่องที่เลื่อนเอง" ไปหา element
// หน้าโค้ชต้องใช้แบบหลัง เพราะบทสนทนาเลื่อนอยู่ในกล่องของตัวเอง ไม่ใช่ทั้งหน้า (DESIGN.md)
type Screen = { name: string; path: string; anchor?: string; anchorSelector?: string };

const SCREENS: Screen[] = [
  { name: "checkin", path: "/checkin" },
  { name: "dashboard", path: "/dashboard", anchor: "แนวโน้มรายวัน" },
  // ฟองข้อความของผู้ใช้ใบล่างสุด — เปิดภาพด้วยคำถาม ไม่ใช่กลางคำตอบของโค้ช
  { name: "coach", path: "/coach", anchorSelector: ".rounded-br-sm" },
];

const HIDE_DEV_OVERLAY = `nextjs-portal, [data-nextjs-toast], #__next-build-watcher { display: none !important; }`;

const PHONE = { width: 390, height: 844 };
const SCALE = 2;
const RADIUS = 30;

const BORDER = {
  light: "rgba(15, 23, 42, 0.12)",
  dark: "rgba(255, 255, 255, 0.16)",
} as const;

function requireCwebp() {
  try {
    execFileSync("cwebp", ["-version"], { stdio: "ignore" });
  } catch {
    throw new Error("ไม่มีคำสั่ง cwebp — ติดตั้งด้วย `brew install webp` ก่อนรันสคริปต์นี้");
  }
}

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");
  await page.getByLabel("อีเมล", { exact: true }).fill(EMAIL);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: /เข้าสู่ระบบ|ล็อกอิน/ }).click();
  await page.waitForURL(/dashboard|checkin|onboarding/, { timeout: 20000 });
}

function frameMarkup(dataUri: string, scheme: "light" | "dark") {
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  html, body { margin: 0; background: transparent; }
  body { display: inline-block; padding: 24px; }
  .frame {
    width: ${PHONE.width}px;
    height: ${PHONE.height}px;
    border-radius: ${RADIUS}px;
    border: 1px solid ${BORDER[scheme]};
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.22);
    line-height: 0;
  }
  .frame img { width: 100%; height: 100%; display: block; }
</style></head>
<body><div class="frame"><img src="${dataUri}"></div></body></html>`;
}

async function frameAndSave(
  browser: Browser,
  raw: Buffer,
  scheme: "light" | "dark",
  target: string
) {
  const context = await browser.newContext({
    viewport: { width: PHONE.width + 80, height: PHONE.height + 80 },
    deviceScaleFactor: SCALE,
  });
  const page = await context.newPage();
  const dataUri = `data:image/png;base64,${raw.toString("base64")}`;
  await page.setContent(frameMarkup(dataUri, scheme), { waitUntil: "load" });
  const png = await page.locator(".frame").screenshot({ omitBackground: true });
  await context.close();

  const temporary = `${target}.png`;
  writeFileSync(temporary, png);
  execFileSync("cwebp", ["-q", "88", "-alpha_q", "100", "-quiet", temporary, "-o", target]);
  rmSync(temporary);
  return readFileSync(target).length;
}

async function capture(browser: Browser, scheme: "light" | "dark", problems: string[]) {
  const context = await browser.newContext({
    ...devices["iPhone 13"],
    viewport: PHONE,
    deviceScaleFactor: SCALE,
    colorScheme: scheme,
    locale: "th-TH",
  });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") {
      problems.push(`${scheme}: console error — ${message.text().slice(0, 140)}`);
    }
  });
  await login(page);

  for (const { name, path, anchor, anchorSelector } of SCREENS) {
    await page.goto(`${BASE}${path}`);
    await page.waitForLoadState("networkidle");
    await page.addStyleTag({ content: HIDE_DEV_OVERLAY });
    await page.waitForTimeout(800);

    const [scrollWidth, clientWidth] = await Promise.all([
      page.evaluate(() => document.documentElement.scrollWidth),
      page.evaluate(() => document.documentElement.clientWidth),
    ]);
    if (scrollWidth > clientWidth + 1) {
      problems.push(`${scheme}/${name}: เลื่อนแนวนอนได้ (${scrollWidth} > ${clientWidth})`);
    }

    if (anchor) {
      const target = page.getByText(anchor, { exact: true }).first();
      if ((await target.count()) === 0) {
        problems.push(`${scheme}/${name}: หาจุดเลื่อน "${anchor}" ไม่เจอ — ภาพจะเป็นหัวหน้าแทน`);
      } else {
        const top = await target.evaluate((node) => {
          const card = node.closest("[data-slot='card']") ?? node;
          return window.scrollY + card.getBoundingClientRect().top;
        });
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top - 72);
        await page.waitForTimeout(500);
      }
    }

    if (anchorSelector) {
      const target = page.locator(anchorSelector).last();
      if ((await target.count()) === 0) {
        problems.push(
          `${scheme}/${name}: หา "${anchorSelector}" ไม่เจอ — ภาพจะเป็นตำแหน่งที่หน้าเปิดมา`
        );
      } else {
        // scrollIntoView เลื่อนให้ทุกชั้นที่เลื่อนได้ รวมกล่องบทสนทนาที่เลื่อนในตัวเอง
        await target.evaluate((node, pad) => {
          node.scrollIntoView({ block: "start", behavior: "instant" });
          for (let el = node.parentElement; el; el = el.parentElement) {
            const overflow = getComputedStyle(el).overflowY;
            if (
              (overflow === "auto" || overflow === "scroll") &&
              el.scrollHeight > el.clientHeight
            ) {
              el.scrollTop -= pad;
              return;
            }
          }
          window.scrollBy(0, -pad);
        }, 14);
        await page.waitForTimeout(500);
      }
    }

    const raw = await page.screenshot({ fullPage: false });
    const file = join(OUT, `${scheme}-phone-${name}.webp`);
    const bytes = await frameAndSave(browser, raw, scheme, file);
    console.log(`  ${file}  ${(bytes / 1024).toFixed(0)} KB`);
  }

  await context.close();
}

async function run() {
  requireCwebp();
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const problems: string[] = [];

  console.log(`ถ่ายภาพสำหรับ README จาก ${BASE} ด้วยบัญชี ${EMAIL} → ${OUT}\n`);

  for (const scheme of ["light", "dark"] as const) {
    await capture(browser, scheme, problems);
  }

  await browser.close();

  const unique = [...new Set(problems)];
  console.log(
    unique.length > 0 ? `\n⚠️  เจอปัญหา:\n${unique.join("\n")}` : "\nไม่เจอปัญหาโครงสร้าง"
  );
  if (unique.length > 0) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
