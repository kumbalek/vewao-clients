import {
  expect,
  test,
  type BrowserContext,
  type Locator,
  type Page,
} from "@playwright/test"

import { TEST_GA_ID } from "../playwright.config"

const MOCK = "http://127.0.0.1:9101"
const SHOP = "http://127.0.0.1:8101"

type ConsentRecord = { version: number; decidedAt: string; granted: string[] }

// The landing page's hero animation competes with React for the main thread;
// these tests mostly start there.
test.use({ reducedMotion: "reduce" })

// Analytics is intercepted so no real request leaves and the requested URLs
// can be asserted on; the list is cleared per test in beforeEach.
const gaRequests: string[] = []
const isGtagScript = (url: string) =>
  url.startsWith(`https://www.googletagmanager.com/gtag/js?id=${TEST_GA_ID}`)

// Server-rendered controls ignore input until React hydrates them.
async function waitForHydration(page: Page, control: Locator) {
  await expect(control).toBeVisible()
  await page.waitForFunction(
    (element) =>
      !!element && Object.keys(element).some((key) => key.startsWith("__reactFiber")),
    await control.elementHandle()
  )
}

const banner = (page: Page) => page.getByRole("region", { name: "Cookies na tomto webu" })
const analyticsCheckbox = (page: Page) =>
  banner(page).getByRole("checkbox", { name: "Analytické" })
const footerSettingsButton = (page: Page) =>
  page.getByRole("contentinfo").getByRole("button", { name: "Nastavení cookies" })

/** The parsed `vw_consent` record of the context, failing if it is missing. */
async function consentCookie(context: BrowserContext): Promise<ConsentRecord> {
  const cookie = (await context.cookies()).find((entry) => entry.name === "vw_consent")
  expect(cookie, "the consent cookie should be stored").toBeDefined()
  return JSON.parse(decodeURIComponent(cookie!.value)) as ConsentRecord
}

/** A decided consent record, as the banner itself would store it. */
async function decideConsent(context: BrowserContext, granted: string[]) {
  await context.addCookies([
    {
      name: "vw_consent",
      value: encodeURIComponent(
        JSON.stringify({ version: 1, decidedAt: new Date().toISOString(), granted })
      ),
      url: SHOP,
      sameSite: "Lax",
    },
  ])
}

test.beforeEach(async ({ context, request }) => {
  await request.post(`${MOCK}/__reset`)
  gaRequests.splice(0)
  await context.route("https://www.googletagmanager.com/**", (route) => {
    gaRequests.push(route.request().url())
    return route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "",
    })
  })
  await context.addCookies([
    { name: "_medusa_cart_id", value: `cart_test_${crypto.randomUUID()}`, url: SHOP, sameSite: "Lax" },
    { name: "_medusa_cache_id", value: crypto.randomUUID(), url: SHOP, sameSite: "Lax" },
  ])
})

test.describe("first visit", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("shows the banner with equal actions, the policy link and no analytics", async ({ page }) => {
    await page.goto("/cz")
    const consent = banner(page)
    // The banner renders only after hydration, so wait for visibility.
    await expect(consent).toBeVisible()
    const reject = consent.getByRole("button", { name: "Odmítnout vše" })
    const accept = consent.getByRole("button", { name: "Přijmout vše" })
    // Equally weighted: the same element styling, neither one demoted to a link.
    await expect(reject).toHaveClass("vw-cookie-consent__button")
    await expect(accept).toHaveClass("vw-cookie-consent__button")
    await expect(consent.getByRole("link", { name: "Více o cookies" })).toHaveAttribute(
      "href",
      "/cz/content/cookies"
    )

    expect(gaRequests).toEqual([])
  })

  test("reject all hides the banner, stores no consent and survives a reload", async ({ page, context }) => {
    await page.goto("/cz")
    const consent = banner(page)
    await expect(consent).toBeVisible()
    await consent.getByRole("button", { name: "Odmítnout vše" }).click()

    await expect(consent).toBeHidden()
    expect((await consentCookie(context)).granted).toEqual([])

    await page.reload()
    await waitForHydration(page, footerSettingsButton(page))
    await expect(consent).toBeHidden()
    // A short window for any wrongly gated script to show itself.
    await page.waitForTimeout(1_000)
    expect(gaRequests).toEqual([])
  })

  test("accept all stores analytics, loads gtag and survives a reload", async ({ page, context }) => {
    await page.goto("/cz")
    const consent = banner(page)
    await expect(consent).toBeVisible()
    await consent.getByRole("button", { name: "Přijmout vše" }).click()

    await expect(consent).toBeHidden()
    expect((await consentCookie(context)).granted).toEqual(["analytics"])
    await expect.poll(() => gaRequests.some(isGtagScript)).toBe(true)

    gaRequests.splice(0)
    await page.reload()
    await waitForHydration(page, footerSettingsButton(page))
    await expect(consent).toBeHidden()
    await expect.poll(() => gaRequests.some(isGtagScript)).toBe(true)
  })

  test("customize asks for analytics explicitly and stores only what is checked", async ({ page, context }) => {
    await page.goto("/cz")
    const consent = banner(page)
    await expect(consent).toBeVisible()
    const customize = consent.getByRole("button", { name: "Nastavit" })
    await customize.click()

    await expect(customize).toHaveAttribute("aria-expanded", "true")
    await expect(analyticsCheckbox(page)).not.toBeChecked()
    await analyticsCheckbox(page).check()
    await consent.getByRole("button", { name: "Uložit výběr" }).click()

    await expect(consent).toBeHidden()
    expect((await consentCookie(context)).granted).toEqual(["analytics"])
  })
})

test.describe("footer settings", () => {
  test("reopens with keyboard, prefills the stored choice and returns focus", async ({ page, context }) => {
    // Default context: analytics already decided and rejected.
    await page.goto("/cz")
    const settings = footerSettingsButton(page)
    await waitForHydration(page, settings)

    // Reopen by keyboard: focus the footer button and press Enter.
    await settings.focus()
    await page.keyboard.press("Enter")
    const consent = banner(page)
    await expect(consent).toBeVisible()
    const heading = consent.getByRole("heading", { name: "Cookies na tomto webu" })
    await expect(heading).toBeFocused()
    await expect(analyticsCheckbox(page)).not.toBeChecked()

    // From the heading, Tab reaches: policy link, reject, accept, customize,
    // checkbox, save — the banner's own DOM order.
    for (let i = 0; i < 5; i++) await page.keyboard.press("Tab")
    await expect(analyticsCheckbox(page)).toBeFocused()
    await page.keyboard.press("Space")
    await expect(analyticsCheckbox(page)).toBeChecked()
    await page.keyboard.press("Tab")
    await expect(consent.getByRole("button", { name: "Uložit výběr" })).toBeFocused()
    await page.keyboard.press("Enter")

    await expect(consent).toBeHidden()
    await expect(settings).toBeFocused()
    expect((await consentCookie(context)).granted).toEqual(["analytics"])
  })
})

test("withdrawing analytics deletes _ga and reloads without it", async ({ page, context }) => {
  await decideConsent(context, ["analytics"])
  await context.addCookies([{ name: "_ga", value: "GA1.1.123.456", url: SHOP, sameSite: "Lax" }])

  await page.goto("/cz")
  await expect.poll(() => gaRequests.some(isGtagScript)).toBe(true)

  const settings = footerSettingsButton(page)
  await waitForHydration(page, settings)
  await settings.click()
  const consent = banner(page)
  await expect(consent).toBeVisible()
  await expect(analyticsCheckbox(page)).toBeChecked()
  await analyticsCheckbox(page).uncheck()

  // Saving triggers the withdrawal: cookies deleted, then the page reloads
  // without analytics. Watch for the reload before clicking.
  gaRequests.splice(0)
  const reloaded = page.waitForEvent("load")
  await consent.getByRole("button", { name: "Uložit výběr" }).click()
  await reloaded

  // A short window for any wrongly kept script to show itself.
  await page.waitForTimeout(1_000)
  const cookieNames = (await context.cookies()).map((cookie) => cookie.name)
  expect(cookieNames).not.toContain("_ga")
  expect((await consentCookie(context)).granted).toEqual([])
  expect(gaRequests).toEqual([])
  await expect(consent).toBeHidden()
})

test("cookies page lists necessary and analytics cookies and offers settings", async ({ page }) => {
  await page.goto("/cz/content/cookies")
  await expect(page.getByRole("heading", { name: "Cookies", level: 1 })).toBeVisible()
  await expect(page.getByText("_medusa_cart_id", { exact: true })).toBeVisible()
  await expect(page.getByText("vw_consent", { exact: true })).toBeVisible()
  await expect(page.getByText("_ga", { exact: true })).toBeVisible()
  // The in-text button (the footer has its own, later in the DOM).
  await expect(page.getByRole("button", { name: "Nastavení cookies" }).first()).toBeVisible()
})