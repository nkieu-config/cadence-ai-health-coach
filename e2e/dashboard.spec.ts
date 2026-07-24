import { expect, test, type Page } from "@playwright/test";
import { expectNoTinyThai, expectTouchTargets } from "./checks";

// เทสต์ตรรกะ/ข้อมูล — ผลไม่ขึ้นกับขนาดจอ/ธีม จึงรันโปรเจกต์เดียว ไม่คูณ 4 จอ
// (การเปิดหน้าอ่านออกกดได้ในหลายจอ อยู่ที่ routes.spec.ts)

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

  await expectNoTinyThai(page);
});

// ด่านหน้าอื่นกวาดแค่ตอนเปิดหน้ามา สถานะที่ต้องกดก่อนถึงจะโผล่จึงไม่เคยถูกตรวจ
// (ไทย 11px ใน guided flow เคยรอดด่านมาได้เพราะเหตุนี้)
test("coach — สถานะที่ต้องกดก่อนเห็น ก็ต้องอ่านออกและกดได้", async ({ page }) => {
  await page.goto("/coach");
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "ตั้งเป้าสัปดาห์หน้า" }).click();
  await expect(page.getByText("อยากเริ่มจากด้านไหนดีครับ")).toBeVisible();
  await expectNoTinyThai(page);
  await expectTouchTargets(page);

  await page.getByRole("button", { name: /^การกิน/ }).click();
  await expect(page.getByText(/เลือกวันในสัปดาห์หน้า/)).toBeVisible();
  await expectNoTinyThai(page);
  await expectTouchTargets(page);
});

test("coach — ทางเข้า guided flow ต้องอยู่แม้มีประวัติแชท (demo script สไลด์ 7)", async ({
  page,
}) => {
  await page.goto("/coach");
  await page.waitForLoadState("networkidle");

  const entry = page.getByRole("button", { name: "ตั้งเป้าสัปดาห์หน้า" });
  await expect(
    entry,
    "บัญชี demo มีประวัติแชทเสมอ — ถ้า chip หาย flow เดินโชว์บนเวทีไม่ได้"
  ).toBeVisible();

  await entry.click();
  await expect(page.getByText("อยากเริ่มจากด้านไหนดีครับ")).toBeVisible();

  await page.getByRole("button", { name: "ยกเลิกการตั้งเป้าหมาย" }).click();
  await expect(page.getByRole("textbox", { name: "พิมพ์ข้อความถึงโค้ช" })).toBeVisible();
});
