import { expect, test } from "@playwright/test";
import { expectUsablePage, watchConsole } from "./checks";

const AUTH_ROUTES = [
  { path: "/login", heading: "เข้าสู่ระบบ" },
  { path: "/register", heading: "สมัครสมาชิก" },
];

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

  // Next.js มี route announcer role=alert ของตัวเองอยู่แล้ว จึงต้องเจาะเฉพาะในฟอร์ม
  const alert = page.locator("form").getByRole("alert");
  await expect(alert, "error ต้องเป็น role=alert เพื่อให้ screen reader ประกาศ").toBeVisible();
  await expect(alert).toContainText("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
});
