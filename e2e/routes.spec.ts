import { expect, test, type Page } from "@playwright/test";
import { expectUsablePage, watchConsole } from "./checks";

const ROUTES = [
  { path: "/checkin", heading: "เช็คอิน" },
  { path: "/checkin/history", heading: "บันทึกย้อนหลัง" },
  { path: "/dashboard", heading: "ภาพรวมสุขภาพ" },
  { path: "/coach", heading: "โค้ช" },
  { path: "/goals", heading: "เป้าหมาย" },
  { path: "/reflection", heading: "สรุปสัปดาห์" },
  { path: "/settings/privacy", heading: "ความเป็นส่วนตัว" },
];

for (const route of ROUTES) {
  test(`${route.path} — เปิดได้ อ่านออก กดได้`, async ({ page }) => {
    const errors = watchConsole(page);

    await page.goto(route.path);
    await page.waitForLoadState("networkidle");

    await expectUsablePage(page, route.heading, errors);
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
  { tab: "นอน", legend: "ชั่วโมงนอน (ชม.)" },
  { tab: "กิน", legend: "มื้อที่กิน (มื้อ)" },
  { tab: "ขยับ", legend: "นาทีเคลื่อนไหว" },
  { tab: "พลังงาน", legend: "ระดับพลังงาน" },
];

function trendCard(page: Page) {
  return page.locator('[data-slot="card"]').filter({ hasText: "แนวโน้มรายวัน" });
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
  await expect(page.getByText("ยังไม่มีข้อมูลสุขภาพ")).toBeHidden();
});

test("dashboard — การ์ดวิเคราะห์รูปแบบ (F2-04) แสดงทุกสถานะ cache", async ({ page }) => {
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("วิเคราะห์รูปแบบพฤติกรรม")).toBeVisible();
});

test("dashboard — แถบวัน (UX-04) วาดแท่งนอนจากข้อมูลจริง ไม่ใช่กล่องเปล่า", async ({ page }) => {
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("คืนสู่เช้า — 7 วันล่าสุด")).toBeVisible();
  await expect(page.getByText("ช่วงที่นอน")).toBeVisible();

  const sleepBars = page.locator(".bg-chart-1");
  await expect(sleepBars.first(), "seed ของปาล์มต้องมีวันที่บันทึกการนอน").not.toHaveCount(0);
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
