import { expect, test, type Locator, type Page } from "@playwright/test"

const MOCK = "http://127.0.0.1:9101"
const SHOP = "http://127.0.0.1:8101"

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
  // The menu lists the CMS's categories and their procedures.
  await expect(page.getByRole("link", { name: "Testovací procedura" })).toHaveAttribute(
    "href",
    "/cz/procedury/akupunktura/testovaci-procedura"
  )
  await page.keyboard.press("Escape")
  await expect(procedures).toHaveAttribute("aria-expanded", "false")
  await expect(procedures).toBeFocused()

  const shop = nav.getByRole("button", { name: "Shop" })
  await shop.hover()
  await expect(shop).toHaveAttribute("aria-expanded", "true")
  await page.getByRole("link", { name: "Všechny produkty" }).first().click()
  await expect(page).toHaveURL(/\/cz\/store$/)
  await expect(shop).toHaveAttribute("aria-expanded", "false")
})

test("the mobile header opens a full-screen menu", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile layout")
  await page.goto("/cz")

  await expect(page.getByRole("link", { name: "Rezervovat" })).toBeVisible()
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
  await expect(menu.getByRole("link", { name: "Akupunktura", exact: true })).toHaveAttribute(
    "href",
    "/cz/procedury/akupunktura"
  )

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

  await expect(page).toHaveURL(new RegExp(`/cz/store\\?q=${term}$`))
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

test("the footer shows the real contact details and marks missing content", async ({
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
  // Content the merchant has not supplied yet is visibly marked, never invented.
  await expect(footer.locator("[data-placeholder]")).toHaveCount(5)
})
