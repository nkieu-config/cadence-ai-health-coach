import { expect, test } from "@playwright/test";
import { expectUsablePage, watchConsole } from "./checks";

const AUTH_ROUTES = [
  { path: "/login", heading: "เข้าสู่ระบบ" },
  { path: "/register", heading: "สมัครสมาชิก" },
];

// หน้ากู้รหัสผ่านสร้างไว้แล้วแต่ยังไม่เปิดใช้ — ไม่มีลิงก์จากหน้า login จนกว่าจะพิสูจน์ว่าอีเมลส่งออกจริง
// เทสต์นี้คุมไว้ว่าหน้ายังเปิดได้และยังอยู่ใน PUBLIC_PATHS (เคยหลุดแล้วโดน middleware เด้งกลับ)
const RECOVERY_ROUTES = [
  { path: "/forgot-password", heading: "ลืมรหัสผ่าน" },
  { path: "/reset-password", heading: "ตั้งรหัสผ่านใหม่" },
];

for (const route of RECOVERY_ROUTES) {
  test(`${route.path} — เปิดได้เองโดยยังไม่ล็อกอิน`, async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(route.path);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(new RegExp(`${route.path}$`));
    await expectUsablePage(page, route.heading, errors);
  });
}

test("/login — ยังไม่เปิดทางไปหน้ากู้รหัสผ่าน (รอพิสูจน์ว่าอีเมลส่งออกจริง)", async ({ page }) => {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  await expect(
    page.getByRole("link", { name: "ลืมรหัสผ่าน?" }),
    "ห้ามโชว์ลิงก์จนกว่าจะทดสอบว่าอีเมลถึงผู้ใช้จริง — ไม่งั้นหน้าจอบอกว่าส่งแล้วทั้งที่ไม่มีอะไรมา"
  ).toHaveCount(0);
});

for (const route of AUTH_ROUTES) {
  test(`${route.path} — เปิดได้ อ่านออก กดได้ (ยังไม่ล็อกอิน)`, async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(route.path);
    await page.waitForLoadState("networkidle");
    await expectUsablePage(page, route.heading, errors);
  });

  test(`${route.path} — ปุ่มดูรหัสผ่านสลับการมองเห็นจริง`, async ({ page }) => {
    await page.goto(route.path);
    await page.waitForLoadState("networkidle");

    const password = page.locator("#password");
    await expect(password).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "แสดงรหัสผ่าน" }).click();
    await expect(password).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: "ซ่อนรหัสผ่าน" }).click();
    await expect(password).toHaveAttribute("type", "password");
  });
}

test("/login — รหัสผ่านผิดขึ้น error ที่ screen reader ได้ยิน ไม่บอกว่าช่องไหนผิด", async ({
  page,
}) => {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  await page.locator("#email").fill("not-a-real-user@example.com");
  await page.locator("#password").fill("wrong-password-123");
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

  const alert = page.locator("form").getByRole("alert");
  await expect(alert, "error ต้องเป็น role=alert เพื่อให้ screen reader ประกาศ").toBeVisible();
  await expect(alert).toContainText("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
});
