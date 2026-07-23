import { test } from "@playwright/test";
import { expectUsablePage, watchConsole } from "./checks";

// smoke: ทุกหน้าหลัง login เปิดได้ อ่านออก กดได้ — รันหลายจอ/ธีม (overflow/contrast/touch)
// เทสต์ตรรกะ/ข้อมูลของ dashboard + coach อยู่ที่ dashboard.spec.ts (รันจอเดียวพอ)
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
