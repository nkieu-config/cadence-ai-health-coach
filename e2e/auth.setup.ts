import { expect, test as setup } from "@playwright/test";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value?.trim()) throw new Error(`ต้องตั้ง ${name} ใน .env.local ก่อน — ดู .env.example`);
  return value;
}

const DEMO_EMAIL = requireEnv("DEMO_EMAIL");
const DEMO_PASSWORD = requireEnv("DEMO_PASSWORD");
const STATE = "e2e/.auth/demo.json";

setup("ล็อกอินบัญชี demo แล้วเก็บ session ไว้ให้เทสต์อื่นใช้", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("อีเมล", { exact: true }).fill(DEMO_EMAIL);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

  await page.waitForURL(/\/checkin/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeAttached();

  await page.context().storageState({ path: STATE });
});
