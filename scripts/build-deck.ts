import { chromium } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const QR = resolve("docs/pitch/deck/qr-app.png");

// เพดานตัวเล็กต่างกันตามระยะอ่าน: สไลด์อ่านจากหลังห้อง เอกสารแผ่นเดียวอ่านในมือ
const DOCS = [
  {
    file: resolve("docs/pitch/deck/deck.html"),
    size: { width: 1280, height: 720 },
    minThai: 18,
    targets: [
      { theme: "dark", out: "docs/pitch/deck.pdf" },
      { theme: "light", out: "docs/pitch/deck-light.pdf" },
    ],
  },
  {
    file: resolve("docs/pitch/deck/showcase.html"),
    size: { width: 1280, height: 720 },
    minThai: 18,
    targets: [
      { theme: "dark", out: "docs/pitch/showcase.pdf" },
      { theme: "light", out: "docs/pitch/showcase-light.pdf" },
    ],
  },
  {
    file: resolve("docs/pitch/deck/onepager.html"),
    size: { width: 794, height: 1123 },
    minThai: 11,
    targets: [{ theme: "light", out: "docs/pitch/onepager.pdf" }],
  },
];

async function render(
  file: string,
  size: { width: number; height: number },
  minThai: number,
  theme: string,
  out: string
) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: size });
  const missing: string[] = [];
  page.on("requestfailed", (request) => missing.push(request.url()));

  await page.goto(`file://${file}`, { waitUntil: "networkidle" });
  await page.evaluate((value) => document.documentElement.setAttribute("data-theme", value), theme);

  const qrMissing = !existsSync(QR);
  if (qrMissing) {
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-qr", "missing");
      document.querySelectorAll(".qr img").forEach((img) => img.remove());
    });
  }

  await page.evaluate(() => document.fonts.ready);

  const report = await page.evaluate((floor) => {
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
          return parseFloat(getComputedStyle(el).fontSize) < floor;
        })
        .map((el) => (el.textContent ?? "").trim().slice(0, 24)),
      thaiFont: document.fonts.check('600 52px "Plex Thai"', "คุยกับโค้ช"),
    };
  }, minThai);

  await page.pdf({
    path: out,
    width: `${size.width}px`,
    height: `${size.height}px`,
    printBackground: true,
    pageRanges: "1-",
  });
  await browser.close();

  // QR ที่ยังไม่ได้ใส่มีคำเตือนของตัวเองท้ายผลรันแล้ว ไม่ต้องนับซ้ำเป็นภาพโหลดไม่ได้
  const ignored = (url: string) =>
    url.startsWith("data:") || (qrMissing && url.endsWith("qr-app.png"));
  return { ...report, missing: missing.filter((url) => !ignored(url)) };
}

async function main() {
  const shots = readdirSync("docs/pitch/screenshots");

  for (const doc of DOCS) {
    for (const { theme, out } of doc.targets) {
      const r = await render(doc.file, doc.size, doc.minThai, theme, out);
      const problems = [
        r.overflowing.length
          ? `เนื้อหาล้นหน้า ${r.overflowing.map((o) => `${o.index} (+${o.over}px)`).join(", ")}`
          : "",
        r.brokenImages ? `ภาพเสีย ${r.brokenImages} ใบ` : "",
        r.missing.length ? `โหลดไม่ได้: ${r.missing.join(", ")}` : "",
        r.tinyThai.length ? `ไทยเล็กกว่า ${doc.minThai}px: ${r.tinyThai.join(" · ")}` : "",
        r.thaiFont ? "" : "ฟอนต์ไทยไม่ติด — ตกไปใช้ fallback",
      ].filter(Boolean);

      console.log(`${out} — ${r.slides} หน้า · ธีม ${theme}`);
      if (problems.length) {
        problems.forEach((problem) => console.log(`  ✗ ${problem}`));
        process.exitCode = 1;
      } else {
        console.log(`  ✓ ไม่มีเนื้อหาล้น · ภาพครบ · ฟอนต์ไทยติด · ไทยไม่ต่ำกว่า ${doc.minThai}px`);
      }
    }
  }

  if (!existsSync(QR)) {
    console.log(
      `\n⚠️ ยังไม่มี ${QR}\n` +
        `   showcase กับ onepager วางกรอบ QR ไว้แล้วแต่ยังเป็นช่องว่าง — กรรมการสแกนลองเองไม่ได้\n` +
        `   สร้าง QR ของ https://personal-healthcoach.vercel.app เป็น PNG สี่เหลี่ยมจัตุรัส ≥ 600px\n` +
        `   บันทึกทับที่ path ข้างบน แล้วรัน npm run deck ใหม่`
    );
  }

  console.log(
    `\nภาพในคลัง ${shots.length} ใบ · แก้เนื้อหาใน docs/pitch/deck/ แล้วรัน npm run deck ใหม่`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
