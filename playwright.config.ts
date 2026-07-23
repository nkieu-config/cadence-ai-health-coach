import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

const loggedIn = {
  storageState: "e2e/.auth/demo.json",
  browserName: "chromium" as const,
};

const SMOKE = [/routes\.spec\.ts/];
const SMOKE_WITH_THEME = [/routes\.spec\.ts/, /theme\.spec\.ts/];

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: process.env.CI ? 1 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // smoke: 7 route "เปิดได้ อ่านออก กดได้" — จอ + ธีมต่างกันจริง (overflow/contrast/touch)
    // 4 จอครอบเงื่อนไขครบ: ความกว้าง {320, มือถือ, เดสก์ท็อป} × contrast {light, dark}
    // theme.spec ผูกกับ light (320px) และ dark (มือถือ) จอเดียวละพอ — ธีมไม่ขึ้นกับความกว้าง
    {
      name: "smoke · 320px light",
      dependencies: ["setup"],
      testMatch: SMOKE_WITH_THEME,
      use: { ...devices["iPhone SE"], ...loggedIn, colorScheme: "light" },
    },
    {
      name: "smoke · มือถือ dark",
      dependencies: ["setup"],
      testMatch: SMOKE_WITH_THEME,
      use: { ...devices["iPhone 14"], ...loggedIn, colorScheme: "dark" },
    },
    {
      name: "smoke · เดสก์ท็อป light",
      dependencies: ["setup"],
      testMatch: SMOKE,
      use: { ...devices["Desktop Chrome"], ...loggedIn, colorScheme: "light" },
    },
    {
      name: "smoke · เดสก์ท็อป dark",
      dependencies: ["setup"],
      testMatch: SMOKE,
      use: { ...devices["Desktop Chrome"], ...loggedIn, colorScheme: "dark" },
    },

    // ตรรกะ + เขียนข้อมูล — DOM/ข้อมูลเดียวกันทุกจอ รันครั้งเดียวพอ ไม่ต้องคูณ 4 จอ
    // checkin.spec เขียน demo (upsert วันนี้) อยู่โปรเจกต์เดียว + fullyParallel:false กันเขียนชนกัน
    {
      name: "ตรรกะ + เขียนข้อมูล",
      dependencies: ["setup"],
      testMatch: [/dashboard\.spec\.ts/, /checkin\.spec\.ts/],
      use: { ...devices["iPhone 14"], ...loggedIn, colorScheme: "light" },
    },

    {
      name: "ยังไม่ล็อกอิน · มือถือ",
      testMatch: /auth\.spec\.ts/,
      use: {
        ...devices["iPhone 14"],
        browserName: "chromium",
        colorScheme: "light",
      },
    },
    {
      name: "ยังไม่ล็อกอิน · เดสก์ท็อป dark",
      testMatch: /auth\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        colorScheme: "dark",
      },
    },
  ],

  webServer: {
    // CI build ไว้ให้แล้ว → รัน production server (เหมือนของจริง)
    // เครื่องตัวเองใช้ dev เพื่อความเร็ว
    command: process.env.CI ? "npm run start" : "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
