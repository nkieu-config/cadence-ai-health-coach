import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
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
    {
      name: "มือถือ · light",
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices["iPhone 14"],
        browserName: "chromium",
        colorScheme: "light",
        storageState: "e2e/.auth/demo.json",
      },
    },
    {
      name: "มือถือ · dark",
      dependencies: ["setup"],
      testIgnore: [/auth\.setup\.ts/, /checkin\.spec\.ts/],
      use: {
        ...devices["iPhone 14"],
        browserName: "chromium",
        colorScheme: "dark",
        storageState: "e2e/.auth/demo.json",
      },
    },
    {
      name: "เดสก์ท็อป · dark",
      dependencies: ["setup"],
      testIgnore: [/auth\.setup\.ts/, /checkin\.spec\.ts/],
      use: {
        ...devices["Desktop Chrome"],
        colorScheme: "dark",
        storageState: "e2e/.auth/demo.json",
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
