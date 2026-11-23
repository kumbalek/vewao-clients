import { expect, test, type Locator, type Page } from "@playwright/test"

import { hasPayload } from "./support/payload"

const MOCK = "http://127.0.0.1:9101"
const SHOP = "http://127.0.0.1:8101"

// These pages start on the landing page, whose hero animation competes with
// React for the main thread; the hero has its own spec. Navigations also wait
// for `next dev` to compile the target route on first visit.
test.use({ reducedMotion: "reduce" })
const NAVIGATION = { timeout: 15_000 }

// Server-rendered controls ignore input until React hydrates them.
async function waitForHydration(page: Page, control: Locator) {
  await expect(control).toBeVisible()
  await page.waitForFunction(
    (element) =>
      !!element && Object.keys(element).some((key) => key.startsWith("__reactFiber")),
    await control.elementHandle()
  )
}

test.beforeEach(async ({ context, request }) => {
  await request.post(`${MOCK}/__reset`)
  // The fixture cart holds one item.
  await context.addCookies([
    { name: "_medusa_cart_id", value: `cart_test_${crypto.randomUUID()}`, url: SHOP, sameSite: "Lax" },
    { name: "_medusa_cache_id", value: crypto.randomUUID(), url: SHOP, sameSite: "Lax" },
  ])
})

test("pages have one header, one main region and one footer", async ({ page }) => {
  await page.goto("/cz")
  await expect(page.getByRole("banner")).toHaveCount(1)
  await expect(page.getByRole("main")).toHaveCount(1)
  await expect(page.getByRole("contentinfo")).toHaveCount(1)

  await page.keyboard.press("Tab")
  const skip = page.getByRole("link", { name: "Přeskočit na obsah" })
  await expect(skip).toBeFocused()
  await expect(skip).toHaveAttribute("href", "#main")
})

test("the desktop header offers the wireframe navigation", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop layout")
  await page.goto("/cz")

  const header = page.getByRole("banner")
  await expect(header.getByTestId("free-delivery-note")).toHaveText("Doprava zdarma od 5.000 Kč")
  await expect(header.getByRole("link", { name: "+420 720 980 530" })).toHaveAttribute(
    "href",
    "tel:+420720980530"
  )
  await expect(header.getByRole("link", { name: "Rezervovat" })).toHaveAttribute(
    "href",
    "/cz/content/contact"
  )
  await expect(header.getByRole("link", { name: "Košík, 1 položka" })).toBeVisible()

  const nav = page.getByRole("navigation", { name: "Hlavní navigace" })
  // The desktop project runs at 1280px, where the full navigation first
  // appears: it must fit beside the logo without pushing it off centre.
  const lastItem = await nav.getByRole("link", { name: "Kontakt" }).boundingBox()
  const logo = await header.getByRole("link", { name: "JuditH – úvodní stránka" }).boundingBox()
  expect(lastItem!.x + lastItem!.width).toBeLessThan(logo!.x)
  expect(Math.abs(logo!.x + logo!.width / 2 - page.viewportSize()!.width / 2)).toBeLessThan(2)

  const procedures = nav.getByRole("button", { name: "Procedury" })
  await waitForHydration(page, procedures)

  await procedures.focus()
  await page.keyboard.press("Enter")
  await expect(procedures).toHaveAttribute("aria-expanded", "true")
  // The menu lists the CMS's categories, procedures and sub-procedures.
  if (hasPayload) {
    await expect(page.getByRole("link", { name: "Testovací procedura" })).toHaveAttribute("href", "/cz/testovaci-procedura")
    await expect(page.getByRole("link", { name: "Modelace rtů" })).toHaveAttribute("href", "/cz/modelace-rtu")
  }
  await page.keyboard.press("Escape")
  await expect(procedures).toHaveAttribute("aria-expanded", "false")
  await expect(procedures).toBeFocused()

  const shop = nav.getByRole("button", { name: "Shop" })
  await shop.hover()
  await expect(shop).toHaveAttribute("aria-expanded", "true")
  await header.getByRole("link", { name: /^Herbs/ }).click()
  await expect(page).toHaveURL(/\/cz\/categories\/herbs$/, NAVIGATION)
  await expect(shop).toHaveAttribute("aria-expanded", "false")
})

test("the desktop Shop menu shows the categories as boxes; hovering one shows its subcategories in a row", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "desktop layout")
  await page.goto("/cz")
  const header = page.getByRole("banner")
  const shop = header.getByRole("navigation", { name: "Hlavní navigace" }).getByRole("button", { name: "Shop" })
  await waitForHydration(page, shop)
  await shop.hover()
  await expect(shop).toHaveAttribute("aria-expanded", "true")

  // A box: image, title and subtitle (the category's description).
  const herbs = header.getByRole("link", { name: /^Herbs/ })
  await expect(herbs).toHaveAttribute("href", "/cz/categories/herbs")
  await expect(herbs).toContainText("Bylinné tablety")
  await expect(herbs.locator("img")).toHaveAttribute("src", "/logo.webp")
  await expect(header.getByRole("link", { name: "TCM", exact: true })).toHaveAttribute("href", "/cz/categories/tcm")
  // Only the categories: the logo leads to the shop front, the footer to all products.
  await expect(header.getByRole("link", { name: "Úvod e-shopu" })).toHaveCount(0)
  await expect(header.getByRole("link", { name: "Všechny produkty" })).toHaveCount(0)

  const dp = header.getByRole("list", { name: "DP Dermaceuticals" })
  await expect(dp).toBeHidden()
  await header.getByRole("link", { name: /^DP Dermaceuticals/ }).hover()
  await expect(dp).toBeVisible()
  // Smaller boxes without subtitles, in admin order (rank), not the API's order.
  await expect(dp.getByRole("link")).toHaveText(["Čištění a exfoliace", "DP Masky"])
  await expect(dp.getByRole("link", { name: "DP Masky" })).toHaveAttribute("href", "/cz/categories/dp-masky")
  // Side by side under the categories, not in a column.
  const [first, second] = await Promise.all([
    dp.getByRole("link").nth(0).boundingBox(),
    dp.getByRole("link").nth(1).boundingBox(),
  ])
  expect(Math.abs(first!.y - second!.y)).toBeLessThan(2)
  expect(second!.x).toBeGreaterThan(first!.x + first!.width)

  // Without a mouse: ArrowDown on a category moves into its subcategories.
  await header.getByRole("link", { name: /^DP Dermaceuticals/ }).focus()
  await page.keyboard.press("ArrowDown")
  await expect(dp.getByRole("link", { name: "Čištění a exfoliace" })).toBeFocused()
})

test("the mobile Shop menu shows the category boxes; an arrow opens a category's subcategories", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile layout")
  await page.goto("/cz")
  const open = page.getByRole("button", { name: "Otevřít menu" })
  await waitForHydration(page, open)
  await open.click()
  const menu = page.getByRole("dialog", { name: "Menu" })
  await menu.getByText("Shop", { exact: true }).click()

  const herbs = menu.getByRole("link", { name: /^Herbs/ })
  await expect(herbs).toHaveAttribute("href", "/cz/categories/herbs")
  await expect(herbs).toContainText("Bylinné tablety")
  await expect(menu.getByRole("link", { name: "Úvod e-shopu" })).toHaveCount(0)
  // Only categories with subcategories get an arrow.
  await expect(menu.getByRole("button", { name: /TCM/ })).toHaveCount(0)

  const dp = menu.getByRole("list", { name: "DP Dermaceuticals" })
  const toggle = menu.getByRole("button", { name: "Zobrazit podkategorie: DP Dermaceuticals" })
  await expect(dp).toBeHidden()
  await expect(toggle).toHaveAttribute("aria-expanded", "false")
  await toggle.click()
  await expect(toggle).toHaveAttribute("aria-expanded", "true")
  await expect(dp.getByRole("link")).toHaveText(["Čištění a exfoliace", "DP Masky"])
  await toggle.click()
  await expect(dp).toBeHidden()
})

test("the mobile header opens a full-screen menu", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile layout")
  await page.goto("/cz")

  // The booking bar under the header; the landing hero has its own further down.
  await expect(page.getByRole("link", { name: "Rezervovat" }).first()).toBeVisible()
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  )
  expect(overflows).toBe(false)

  const open = page.getByRole("button", { name: "Otevřít menu" })
  await waitForHydration(page, open)
  await open.click()

  const menu = page.getByRole("dialog", { name: "Menu" })
  await expect(menu).toBeVisible()
  await expect(menu.getByRole("searchbox", { name: "Hledat produkty" })).toBeVisible()
  await expect(menu.getByRole("link", { name: "Košík (1)" })).toBeVisible()

  await menu.getByText("Procedury").click()
  if (hasPayload) {
    await expect(menu.getByRole("link", { name: "Východní medicína", exact: true })).toHaveAttribute("href", "/cz/vychodni-medicina")
    await expect(menu.getByRole("link", { name: "Modelace rtů" })).toHaveAttribute("href", "/cz/modelace-rtu")
  }

  await page.keyboard.press("Escape")
  await expect(menu).toBeHidden()
  await expect(open).toBeFocused()
})

test("header search lists matching products", async ({ page, isMobile, request }) => {
  await page.goto("/cz")

  if (isMobile) {
    const open = page.getByRole("button", { name: "Otevřít menu" })
    await waitForHydration(page, open)
    await open.click()
  }
  // Unique per run: the storefront caches catalogue responses between tests.
  const term = `bylinky${Date.now()}`
  const search = page.getByRole("searchbox", { name: "Hledat produkty" })
  await search.fill(term)
  await search.press("Enter")

  await expect(page).toHaveURL(new RegExp(`/cz/store\\?q=${term}$`), NAVIGATION)
  await expect(page.getByTestId("store-page-title")).toHaveText(`Výsledky hledání „${term}“`)
  await expect(page.getByTestId("search-empty")).toBeVisible()

  const requests = (await (await request.get(`${MOCK}/__requests`)).json()) as {
    path: string
    query?: string
  }[]
  expect(
    requests.some(
      ({ path, query }) =>
        path === "/store/products" && new URLSearchParams(query).get("q") === term
    )
  ).toBe(true)
})

test("the footer shows the real contact details and no placeholders", async ({
  page,
}) => {
  await page.goto("/cz")
  const footer = page.getByRole("contentinfo")

  await expect(footer.getByText("Kosmická 19")).toBeVisible()
  await expect(footer.getByRole("link", { name: "info@bbclinic.cz" })).toHaveAttribute(
    "href",
    "mailto:info@bbclinic.cz"
  )
  await expect(footer.getByRole("link", { name: "Obchodní podmínky" })).toHaveAttribute(
    "href",
    "/cz/content/terms-of-use"
  )
  await expect(footer.getByRole("link", { name: "Cookies" })).toHaveAttribute(
    "href",
    "/cz/content/cookies"
  )
  // The test build enables analytics, so the consent settings are offered.
  await expect(footer.getByRole("button", { name: "Nastavení cookies" })).toBeVisible()
  // The top-level categories, not their subcategories.
  await expect(footer.getByRole("link", { name: "Herbs", exact: true })).toHaveAttribute("href", "/cz/categories/herbs")
  await expect(footer.getByRole("link", { name: "DP Masky" })).toHaveCount(0)
  await expect(footer.getByRole("link", { name: "Doprava a platba" })).toHaveAttribute(
    "href",
    "/cz/content/shipping-and-payment"
  )
  await expect(footer.getByTestId("footer-payment-methods")).toHaveAttribute(
    "alt",
    "Podporované platební metody: Comgate, Visa, Mastercard, Google Pay a Apple Pay"
  )
  // No placeholders: the brand text, social links and newsletter are not in this version (owner, 2026-11-22).
  await expect(footer.locator("[data-placeholder]")).toHaveCount(0)
  await expect(footer.getByText("Newsletter", { exact: false })).toHaveCount(0)
})
