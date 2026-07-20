import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  { path: "/checkin", heading: "เช็คอิน" },
  { path: "/checkin/history", heading: "บันทึกย้อนหลัง" },
  { path: "/dashboard", heading: "ภาพรวมสุขภาพ" },
  { path: "/coach", heading: "โค้ช" },
  { path: "/goals", heading: "เป้าหมาย" },
  { path: "/reflection", heading: "สรุปสัปดาห์" },
  { path: "/settings/privacy", heading: "ความเป็นส่วนตัว" },
];

function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

// ให้เบราว์เซอร์แปลงสีเอง — Tailwind v4 คืน oklab()/color-mix() ไม่ใช่ rgb()
// ถ้า parse สตริงเอง ค่า oklab จะถูกอ่านเป็น RGB แล้วรายงาน contrast ผิดหมด
async function unreadableText(page: Page) {
  return page.evaluate(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    const toRgba = (color: string): [number, number, number, number] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };

    const channel = (c: number) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    const luminance = ([r, g, b]: number[]) =>
      0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

    const backdropOf = (element: Element): [number, number, number] => {
      let node: Element | null = element;
      while (node) {
        const [r, g, b, a] = toRgba(getComputedStyle(node).backgroundColor);
        if (a > 0.5) return [r, g, b];
        node = node.parentElement;
      }
      return toRgba(getComputedStyle(document.body).backgroundColor).slice(0, 3) as [
        number,
        number,
        number,
      ];
    };

    const failures: { text: string; ratio: number }[] = [];
    const nodes = document.querySelectorAll("p, span, li, h1, h2, h3, td, th, label, button, a");

    for (const node of nodes) {
      const text = node.textContent?.trim() ?? "";
      if (!text || text.length > 120) continue;
      if (node.querySelector("p, span, li, td, button, a")) continue;

      const style = getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const box = node.getBoundingClientRect();
      if (box.width < 2 || box.height < 2) continue;

      const backdrop = backdropOf(node);
      const [r, g, b, alpha] = toRgba(style.color);
      // ข้อความโปร่งแสงต้องผสมกับพื้นหลังก่อน ไม่งั้นจะดูเข้มกว่าที่ตาเห็นจริง
      const blended = [r, g, b].map((c, i) => c * alpha + backdrop[i] * (1 - alpha));

      const fg = luminance(blended);
      const bg = luminance(backdrop);
      const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);

      if (ratio < 4.5) {
        failures.push({ text: text.slice(0, 40), ratio: Math.round(ratio * 100) / 100 });
      }
    }

    return failures.sort((a, b) => a.ratio - b.ratio).slice(0, 5);
  });
}

for (const route of ROUTES) {
  test(`${route.path} — เปิดได้ อ่านออก กดได้`, async ({ page }) => {
    const errors = watchConsole(page);

    await page.goto(route.path);
    await page.waitForLoadState("networkidle");

    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1, "ทุกหน้าต้องมี <h1> อันเดียว").toHaveCount(1);
    await expect(h1).toContainText(route.heading);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, "ห้ามมี horizontal scroll").toBeLessThanOrEqual(1);

    const tooSmall = await page.evaluate(() =>
      [...document.querySelectorAll("button, a[href], input, [role=button]")]
        .filter((element) => {
          const box = element.getBoundingClientRect();
          return box.width > 0 && box.height > 0 && box.height < 44;
        })
        .map((element) => `${element.tagName}: ${element.textContent?.trim().slice(0, 24)}`)
        .slice(0, 3)
    );
    expect(tooSmall, "ทุกอย่างที่กดได้ต้องสูง ≥ 44px").toEqual([]);

    expect(await unreadableText(page), "ข้อความต้องอ่านออก (contrast ≥ 4.5:1)").toEqual([]);
    expect(errors, "ห้ามมี console error").toEqual([]);
  });
}

test("dashboard — ปุ่มช่วงเวลา 7/14/30 เปลี่ยนข้อมูลจริง", async ({ page }) => {
  await page.goto("/dashboard?days=30");
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(/บันทึกแล้ว \d+ วัน จาก 30 วัน/)).toBeVisible();

  await page.getByRole("link", { name: "7 วัน" }).click();
  await page.waitForURL(/days=7/);
  await expect(page.getByText(/บันทึกแล้ว \d+ วัน จาก 7 วัน/)).toBeVisible();
});

const PILLAR_TABS = [
  { tab: "ชั่วโมงนอน", legend: "ชั่วโมงนอน (ชม.)" },
  { tab: "การกิน", legend: "มื้อที่กิน (มื้อ)" },
  { tab: "การเคลื่อนไหว", legend: "นาทีเคลื่อนไหว" },
];

function trendCard(page: Page) {
  return page.locator('[data-slot="card"]').filter({ hasText: "กราฟแนวโน้มพฤติกรรม" });
}

async function tallestBar(page: Page) {
  return trendCard(page)
    .locator(".recharts-bar-rectangle path")
    .evaluateAll((bars) => Math.max(0, ...bars.map((bar) => bar.getBoundingClientRect().height)));
}

for (const { tab, legend } of PILLAR_TABS) {
  test(`dashboard — กราฟแนวโน้มแท็บ "${tab}" วาดแท่งจริง`, async ({ page }) => {
    await page.goto("/dashboard?days=14");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: tab, exact: true }).click();

    await expect
      .poll(() => tallestBar(page), {
        message: `แท็บ "${tab}" ต้องมีแท่งที่สูงจริง — แท่งสูง 0 ยังนับเป็น node ใน DOM ได้ การนับ node จึงจับกราฟว่างไม่เจอ`,
      })
      .toBeGreaterThan(1);

    await expect(trendCard(page).getByText(legend), `แท็บ "${tab}" ต้องมี legend`).toBeVisible();
  });
}

test("dashboard — ข้อมูล seed ของปาล์มโผล่จริง ไม่ใช่หน้าว่าง", async ({ page }) => {
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("สรุปวันนี้")).toBeVisible();
  await expect(page.getByText("เป้าหมายสัปดาห์นี้", { exact: true })).toBeVisible();
  await expect(page.getByText("ยินดีต้อนรับสู่ HealthCoach 👋")).toBeHidden();
});

test("dashboard — การ์ดวิเคราะห์รูปแบบ (F2-04) แสดงทุกสถานะ cache", async ({ page }) => {
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("วิเคราะห์รูปแบบพฤติกรรม")).toBeVisible();
});

test("dashboard — marker ปัจจัยรบกวนกดด้วยคีย์บอร์ดได้ (ไม่ต้องใช้เมาส์)", async ({ page }) => {
  await page.goto("/dashboard?days=30");
  await page.waitForLoadState("networkidle");

  const markers = page.getByRole("button", { name: /^ปัจจัยรบกวน/ });
  await expect(markers.first(), "seed ของปาล์มต้องมีวันที่มี disruptor").not.toHaveCount(0);

  await markers.first().focus();
  await page.keyboard.press("Enter");

  await expect(
    page.getByRole("button", { name: "ปิด" }),
    "Enter บน marker ต้องเปิด popover (ปุ่มปิดโผล่เมื่อ locked)"
  ).toBeVisible();
});
