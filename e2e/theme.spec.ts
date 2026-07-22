import { expect, test } from "@playwright/test";

const themeOf = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.dataset.theme);

const schemeOf = (testInfo: import("@playwright/test").TestInfo) =>
  testInfo.project.use.colorScheme === "dark" ? "dark" : "light";

test("ยังไม่เคยกดปุ่ม — ธีมตามค่าเครื่อง", async ({ page }, testInfo) => {
  const scheme = schemeOf(testInfo);
  await page.goto("/dashboard");
  await expect.poll(() => themeOf(page)).toBe(scheme);
});

test("กดปุ่มแล้วสลับ และจำไว้ข้ามการรีเฟรช", async ({ page }, testInfo) => {
  const scheme = schemeOf(testInfo);
  const opposite = scheme === "dark" ? "light" : "dark";

  await page.goto("/dashboard");
  await expect.poll(() => themeOf(page)).toBe(scheme);

  const label = { dark: /โหมดมืด$/, light: /โหมดสว่าง$/ };
  const toggle = page.getByRole("button", { name: label[opposite] });
  await expect(toggle).toBeVisible();
  await toggle.click();

  await expect.poll(() => themeOf(page)).toBe(opposite);
  await expect(
    page.getByRole("button", { name: label[scheme] }),
    "ชื่อปุ่มต้องสลับตามธีม ไม่งั้น screen reader อ่านผิด"
  ).toBeVisible();

  await page.reload();
  await expect
    .poll(() => themeOf(page), { message: "ธีมที่ผู้ใช้เลือกต้องชนะค่าเครื่องหลังรีเฟรช" })
    .toBe(opposite);
});

test("inline script ตั้งธีมก่อน <body> — กันจอขาววาบตอนโหลด", async ({ page }) => {
  const response = await page.goto("/dashboard");
  const html = (await response?.text()) ?? "";
  const script = html.indexOf("cadence-theme");
  expect(script, "ต้องมี inline script ตั้งธีมใน HTML").toBeGreaterThan(-1);
  expect(script, "script ต้องอยู่ก่อน <body> ไม่งั้นจะเห็นธีมผิดวาบหนึ่ง").toBeLessThan(
    html.indexOf("<body")
  );
});
