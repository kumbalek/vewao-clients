import { expect, test, type Locator, type Page } from "@playwright/test"

import { E2E_SHOP_ONLY } from "../playwright.config"

const SHOP = "http://127.0.0.1:8101"

// The temporary production site, the e-shop alone (SITE_MODE=shop, #47):
// run with E2E_SITE_MODE=shop.
test.skip(!E2E_SHOP_ONLY, "Runs with E2E_SITE_MODE=shop")
test.use({ reducedMotion: "reduce" })

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: "_medusa_cart_id", value: `cart_test_${crypto.randomUUID()}`, url: SHOP, sameSite: "Lax" },
    { name: "_medusa_cache_id", value: crypto.randomUUID(), url: SHOP, sameSite: "Lax" },
  ])
})

// Server-rendered controls ignore input until React hydrates them.
async function waitForHydration(page: Page, control: Locator) {
  await expect(control).toBeVisible()
  await page.waitForFunction(
    (element) => !!element && Object.keys(element).some((key) => key.startsWith("__reactFiber")),
    await control.elementHandle()
  )
}

test("the home page is the e-shop's front page", async ({ page }) => {
  await page.goto("/cz")
  await expect(page).toHaveTitle("JuditH")
  await expect(page.getByTestId("category-rail").first()).toBeVisible()
})

// The landing's video hero opens the e-shop's front page (owner, 2026-11-25):
// the four claims, but no links to the clinic's pages (a 404 here) and no booking.
test("the home page opens with the video hero, its claims without links", async ({ page }) => {
  await page.goto("/cz")
  const hero = page.getByTestId("landing-hero")
  await expect(hero).toBeVisible()
  await expect(hero.getByRole("heading", { level: 1 })).toHaveAccessibleName("Snoubíme západ s východem")
  await expect(hero.getByTestId("landing-beat")).toHaveCount(4)
  await expect(hero.getByRole("link")).toHaveCount(0)
  // It starts under the e-shop's header (no booking bar), which floats over it.
  expect(Math.round((await hero.boundingBox())!.y)).toBe(0)
})

test("the header offers the shop, account, cart and delivery country, not the clinic", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop header")
  await page.goto("/cz")
  const header = page.getByRole("banner")
  const nav = header.getByRole("navigation", { name: "Hlavní navigace" })
  await expect(nav.getByRole("button", { name: "Shop" })).toBeVisible()
  await expect(nav.getByRole("button", { name: "Procedury" })).toHaveCount(0)
  await expect(nav.getByRole("link")).toHaveText(["Kontakt"])
  await expect(header.getByTestId("nav-account-link")).toHaveAttribute("href", "/cz/account")
  await expect(header.getByRole("navigation", { name: "Země doručení" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Rezervovat" })).toHaveCount(0)
})

test("the footer links only to pages that exist", async ({ page }) => {
  await page.goto("/cz")
  const footer = page.getByRole("contentinfo")
  // The categories replaced the list of all products (vewao-clients#70).
  await expect(footer.getByRole("link", { name: "Všechny produkty" })).toHaveCount(0)
  await expect(footer.getByRole("link", { name: "Doprava a platba" })).toBeVisible()
  await expect(footer.getByRole("link", { name: "Magazín" })).toHaveCount(0)
  await expect(footer.getByRole("link", { name: "O nás" })).toHaveCount(0)
})

test("the mobile menu has the shop and the delivery country, not the clinic", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile menu")
  await page.goto("/cz")
  const open = page.getByRole("button", { name: "Otevřít menu" })
  await waitForHydration(page, open)
  await open.click()
  const menu = page.getByRole("dialog", { name: "Menu" })
  await expect(menu.getByText("Shop", { exact: true })).toBeVisible()
  await expect(menu.getByText("Procedury", { exact: true })).toHaveCount(0)
  await expect(menu.getByRole("navigation", { name: "Země doručení" })).toBeVisible()
  await expect(menu.getByRole("link", { name: "Rezervovat" })).toHaveCount(0)
  await expect(page.getByRole("link", { name: "Rezervovat" })).toHaveCount(0)
})

test("the full site's pages are not found", async ({ page }) => {
  for (const path of [
    "/cz/magazin",
    "/cz/magazin/rozhovor",
    "/cz/cenik",
    "/cz/novinky",
    "/cz/o-nas",
    "/cz/tradicni-akupunktura",
    "/cz/cms/o-nas",
  ]) {
    expect((await page.goto(path))?.status(), path).toBe(404)
  }
})

test("the e-shop's pages are served", async ({ page }) => {
  for (const path of [
    "/cz/shop",
    "/cz/store",
    "/cz/products/akcni-produkt",
    "/cz/cart",
    "/cz/account",
    "/cz/content/contact",
    "/cz/content/terms-of-use",
    "/cz/content/shipping-and-payment",
    "/cz/odstoupeni-od-smlouvy",
    "/sk/products/akcni-produkt",
  ]) {
    expect((await page.goto(path))?.status(), path).toBe(200)
  }
})
