import { expect, test as setup } from "@playwright/test";

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "palm@example.com";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "PalmDemo2026!";
const STATE = "e2e/.auth/demo.json";

setup("ล็อกอินบัญชี demo แล้วเก็บ session ไว้ให้เทสต์อื่นใช้", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("อีเมล").fill(DEMO_EMAIL);
  await page.getByLabel("รหัสผ่าน").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

  await page.waitForURL(/\/checkin/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeAttached();

  await page.context().storageState({ path: STATE });
});
