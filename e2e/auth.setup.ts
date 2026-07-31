import { expect, test as setup } from "@playwright/test";

const STATE = "e2e/.auth/demo.json";

setup("กดปุ่มบัญชีตัวอย่างแล้วเก็บ session ไว้ให้เทสต์อื่นใช้", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "ลองเลย ด้วยบัญชีตัวอย่าง" }).click();

  await page.waitForURL(/\/checkin|error=demo/, { timeout: 20_000 });
  expect(
    page.url(),
    "ปุ่มเด้งกลับหน้า login = ฝั่ง server ไม่มี DEMO_EMAIL/DEMO_PASSWORD — ดู .env.example"
  ).not.toContain("error=demo");

  await expect(page.getByRole("heading", { level: 1 })).toBeAttached();

  await page.context().storageState({ path: STATE });
});
