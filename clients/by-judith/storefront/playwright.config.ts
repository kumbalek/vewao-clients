import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  use: { baseURL: "http://127.0.0.1:8101", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: [
    {
      command: "node test/mock-medusa.mjs",
      url: "http://127.0.0.1:9101/health",
      reuseExistingServer: false,
    },
    {
      command: "pnpm exec next dev --hostname 127.0.0.1 --port 8101",
      url: "http://127.0.0.1:8101/logo.webp",
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        MEDUSA_BACKEND_URL: "http://127.0.0.1:9101",
        NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: "pk_test_fixture",
        NEXT_PUBLIC_BASE_URL: "http://127.0.0.1:8101",
        NEXT_TELEMETRY_DISABLED: "1",
      },
    },
  ],
})
