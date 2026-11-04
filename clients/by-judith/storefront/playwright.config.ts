import { defineConfig, devices } from "@playwright/test"

/** The test build's GA4 ID: analytics, and so the consent banner, are on. */
export const TEST_GA_ID = "G-TEST000001"
/** Signs CMS preview links in the test build; the workflow migrates with it too. */
export const E2E_PAYLOAD_SECRET = "e2e-payload-secret-not-for-production"

// Every context starts with "analytics rejected" so the banner does not cover
// what other specs click; e2e/cookie-consent.spec.ts starts without it.
const decided = {
  cookies: [
    {
      name: "vw_consent",
      value: encodeURIComponent(
        JSON.stringify({ version: 1, decidedAt: new Date().toISOString(), granted: [] })
      ),
      domain: "127.0.0.1",
      path: "/",
      expires: -1,
      httpOnly: false,
      secure: false,
      sameSite: "Lax" as const,
    },
  ],
  origins: [],
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  // On CI, failures also become annotations, readable without the job log.
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: { baseURL: "http://127.0.0.1:8101", trace: "retain-on-failure", storageState: decided },
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
      // Product fetches use force-cache, and Next keeps that cache on disk
      // across runs: without clearing it, edits to the mock backend's data
      // are not seen. Next 16 keeps dev output in .next/dev (15 used .next).
      command:
        "rm -rf .next/cache/fetch-cache .next/dev/cache/fetch-cache && pnpm exec next dev --hostname 127.0.0.1 --port 8101",
      url: "http://127.0.0.1:8101/logo.webp",
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        MEDUSA_BACKEND_URL: "http://127.0.0.1:9101",
        NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: "pk_test_fixture",
        NEXT_PUBLIC_BASE_URL: "http://127.0.0.1:8101",
        NEXT_TELEMETRY_DISABLED: "1",
        NEXT_PUBLIC_GA_MEASUREMENT_ID: TEST_GA_ID,
        // e2e/cms.spec.ts runs only when a Payload database is configured.
        ...(process.env.E2E_PAYLOAD_DATABASE_URL
          ? {
              PAYLOAD_DATABASE_URL: process.env.E2E_PAYLOAD_DATABASE_URL,
              PAYLOAD_SECRET: E2E_PAYLOAD_SECRET,
            }
          : {}),
      },
    },
  ],
})
