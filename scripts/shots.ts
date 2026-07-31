import { chromium, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value?.trim()) throw new Error(`ต้องตั้ง ${name} ใน .env.local ก่อน — ดู .env.example`);
  return value;
}

const BASE = process.env.SHOTS_BASE_URL ?? "http://localhost:3000";
const EMAIL = requireEnv("DEMO_EMAIL");
const PASSWORD = requireEnv("DEMO_PASSWORD");
const OUT = process.env.SHOTS_OUT ?? "docs/summary/screenshots";

const SCREENS: [string, string][] = [
  ["dashboard", "/dashboard"],
  ["checkin", "/checkin"],
  ["history", "/checkin/history"],
  ["coach", "/coach"],
  ["goals", "/goals"],
  ["reflection", "/reflection"],
  ["privacy", "/settings/privacy"],
];

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof chromium.launch>>["newPage"]>>;

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("networkidle");
  await page.getByLabel("อีเมล", { exact: true }).fill(EMAIL);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: /เข้าสู่ระบบ|ล็อกอิน/ }).click();
  await page.waitForURL(/dashboard|checkin|onboarding/, { timeout: 20000 });
}

async function capture(page: Page, prefix: string, problems: string[]) {
  for (const [name, path] of SCREENS) {
    await page.goto(`${BASE}${path}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(700);

    const [scrollWidth, clientWidth, headings] = await Promise.all([
      page.evaluate(() => document.documentElement.scrollWidth),
      page.evaluate(() => document.documentElement.clientWidth),
      page.locator("h1").count(),
    ]);
    if (scrollWidth > clientWidth + 1) {
      problems.push(`${prefix}/${name}: เลื่อนแนวนอนได้ (${scrollWidth} > ${clientWidth})`);
    }
    if (headings !== 1) problems.push(`${prefix}/${name}: มี h1 ${headings} อัน (ต้องมี 1)`);

    await page.screenshot({ path: `${OUT}/${prefix}-${name}.png`, fullPage: true });
    console.log(`  ${prefix}-${name}.png`);
  }
}

async function run() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const problems: string[] = [];

  console.log(`ถ่ายจอจาก ${BASE} ด้วยบัญชี ${EMAIL} → ${OUT}\n`);

  for (const scheme of ["light", "dark"] as const) {
    for (const [prefix, options] of [
      [`${scheme}-mobile`, { ...devices["iPhone 13"] }],
      [`${scheme}-desktop`, { viewport: { width: 1280, height: 900 } }],
    ] as const) {
      const context = await browser.newContext({
        ...options,
        colorScheme: scheme,
        locale: "th-TH",
      });
      const page = await context.newPage();
      page.on("console", (message) => {
        if (message.type() === "error") {
          problems.push(`${prefix}: console error — ${message.text().slice(0, 140)}`);
        }
      });
      await login(page);
      await capture(page, prefix, problems);
      await context.close();
    }
  }

  await browser.close();

  const unique = [...new Set(problems)];
  console.log(
    unique.length > 0 ? `\n⚠️  เจอปัญหา:\n${unique.join("\n")}` : "\nไม่เจอปัญหาโครงสร้าง"
  );
  console.log(`\nภาพทั้งหมด ${SCREENS.length * 4} รูปอยู่ที่ ${OUT}`);
  if (unique.length > 0) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
