import { chromium } from "@playwright/test";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const DECK = resolve("docs/pitch/deck/deck.html");
const SLIDE = { width: 1280, height: 720 };

const TARGETS = [
  { theme: "dark", out: "docs/pitch/deck.pdf" },
  { theme: "light", out: "docs/pitch/deck-light.pdf" },
];

async function render(theme: string, out: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: SLIDE });
  const missing: string[] = [];
  page.on("requestfailed", (request) => missing.push(request.url()));

  await page.goto(`file://${DECK}`, { waitUntil: "networkidle" });
  await page.evaluate((value) => document.documentElement.setAttribute("data-theme", value), theme);
  await page.evaluate(() => document.fonts.ready);

  const report = await page.evaluate(() => {
    const slides = [...document.querySelectorAll<HTMLElement>(".slide")];
    return {
      slides: slides.length,
      // วัดทั้งระดับสไลด์และระดับกล่องภายใน — flex item ที่ล้นออกมาทับกันเองไม่ทำให้สไลด์สูงขึ้น
      overflowing: slides
        .flatMap((slide, index) =>
          [slide, ...slide.querySelectorAll<HTMLElement>(".grow, .row, .col, ul")].map((box) => ({
            index: index + 1,
            over: box.scrollHeight - box.clientHeight,
          }))
        )
        .filter((item) => item.over > 1),
      brokenImages: [...document.querySelectorAll("img")].filter((img) => !img.naturalWidth).length,
      tinyThai: [...document.querySelectorAll<HTMLElement>("body *")]
        .filter((el) => {
          if (el.children.length > 0) return false;
          if (!/[฀-๿]/.test(el.textContent ?? "")) return false;
          return parseFloat(getComputedStyle(el).fontSize) < 18;
        })
        .map((el) => (el.textContent ?? "").trim().slice(0, 24)),
      thaiFont: document.fonts.check('600 52px "Plex Thai"', "คุยกับโค้ช"),
    };
  });

  await page.pdf({
    path: out,
    width: `${SLIDE.width}px`,
    height: `${SLIDE.height}px`,
    printBackground: true,
    pageRanges: "1-",
  });
  await browser.close();

  return { ...report, missing: missing.filter((url) => !url.startsWith("data:")) };
}

async function main() {
  const shots = readdirSync("docs/pitch/screenshots");
  for (const { theme, out } of TARGETS) {
    const r = await render(theme, out);
    const problems = [
      r.overflowing.length
        ? `เนื้อหาล้นหน้า ${r.overflowing.map((o) => `${o.index} (+${o.over}px)`).join(", ")}`
        : "",
      r.brokenImages ? `ภาพเสีย ${r.brokenImages} ใบ` : "",
      r.missing.length ? `โหลดไม่ได้: ${r.missing.join(", ")}` : "",
      r.tinyThai.length ? `ไทยเล็กกว่า 18px: ${r.tinyThai.join(" · ")}` : "",
      r.thaiFont ? "" : "ฟอนต์ไทยไม่ติด — ตกไปใช้ fallback",
    ].filter(Boolean);

    console.log(`${out} — ${r.slides} หน้า · ธีม ${theme}`);
    if (problems.length) {
      problems.forEach((problem) => console.log(`  ✗ ${problem}`));
      process.exitCode = 1;
    } else {
      console.log("  ✓ ไม่มีเนื้อหาล้น · ภาพครบ · ฟอนต์ไทยติด · ไทยไม่ต่ำกว่า 18px");
    }
  }
  console.log(`\nภาพในคลัง ${shots.length} ใบ · แก้เนื้อหาที่ deck.html แล้วรัน npm run deck ใหม่`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
