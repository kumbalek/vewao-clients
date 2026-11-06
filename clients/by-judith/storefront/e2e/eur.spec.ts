import { expect, test, type BrowserContext, type Locator, type Page } from "@playwright/test"

const MOCK = "http://127.0.0.1:9101"
const SHOP = "http://127.0.0.1:8101"
const NAVIGATION = { timeout: 15_000 }

// Slovakia pays in EUR in a region of its own; the site stays Czech (vewao-clients#45).
test.use({ reducedMotion: "reduce" })

type Logged = { method: string; path: string; body?: Record<string, unknown> }

async function withCart(context: BrowserContext, cartId: string) {
  await context.addCookies([
    { name: "_medusa_cart_id", value: cartId, url: SHOP, sameSite: "Lax" },
    { name: "_medusa_cache_id", value: crypto.randomUUID(), url: SHOP, sameSite: "Lax" },
  ])
}

// Server-rendered controls ignore input until React hydrates them.
async function waitForHydration(page: Page, control: Locator) {
  await expect(control).toBeVisible()
  await page.waitForFunction(
    (element) => !!element && Object.keys(element).some((key) => key.startsWith("__reactFiber")),
    await control.elementHandle()
  )
}

test.beforeEach(async ({ request }) => {
  await request.post(`${MOCK}/__reset`)
})

test("the header switches delivery to Slovakia, with prices in EUR", async ({ page, context, request, isMobile }) => {
  test.skip(isMobile, "desktop service bar")
  const cartId = `cart_test_${crypto.randomUUID()}`
  await withCart(context, cartId)
  await page.goto("/cz/products/akcni-produkt")
  await expect(page.getByTestId("product-price").first()).toContainText("1.490 Kč")

  const header = page.getByRole("banner")
  await expect(header.getByTestId("free-delivery-note")).toHaveText("Doprava zdarma od 5.000 Kč")
  const countries = header.getByRole("navigation", { name: "Země doručení" })
  await expect(countries.locator('[aria-current="true"]')).toHaveText("Česko (Kč)")

  const slovakia = countries.getByRole("button", { name: "Slovensko (€)" })
  await waitForHydration(page, slovakia)
  await slovakia.click()

  await expect(page).toHaveURL(/\/sk\/products\/akcni-produkt$/, NAVIGATION)
  await expect(page.getByTestId("product-price").first()).toContainText("59,90 €")
  await expect(header.getByTestId("free-delivery-note")).toHaveText("Doprava zdarma od 200 €")
  await expect(countries.locator('[aria-current="true"]')).toHaveText("Slovensko (€)")

  // The cart moved to the Slovak region with the page.
  const requests = (await (await request.get(`${MOCK}/__requests`)).json()) as Logged[]
  expect(requests.some((r) => r.method === "POST" && r.path === `/store/carts/${cartId}` && r.body?.region_id === "reg_sk")).toBe(true)
})

test("Slovak addresses are served directly", async ({ page, context }) => {
  await withCart(context, `cart_sk_${crypto.randomUUID()}`)
  const response = await page.goto("/sk/products/akcni-produkt")
  expect(response?.status()).toBe(200)
  await expect(page).toHaveURL(/\/sk\/products\/akcni-produkt$/)
  await expect(page.getByTestId("product-price").first()).toContainText("59,90 €")
})

test("an EUR cart stays in EUR when gift packaging is added", async ({ page, context, request }) => {
  const cartId = `cart_sk_${crypto.randomUUID()}`
  await withCart(context, cartId)
  await page.goto("/sk/cart")
  await expect(page.getByTestId("cart-subtotal")).toHaveText("19,90 €")

  const gift = page.getByTestId("gift-packaging")
  await expect(gift.getByTestId("gift-packaging-price")).toHaveText("7,90 €")
  const checkbox = gift.getByRole("checkbox", { name: "Dárkové balení" })
  await waitForHydration(page, checkbox)
  await checkbox.click()
  await expect(page.getByTestId("product-row")).toHaveCount(2)
  await expect(page.getByTestId("cart-subtotal")).toHaveText("27,80 €")

  // Adding the line never moved the cart back to the Czech region.
  const requests = (await (await request.get(`${MOCK}/__requests`)).json()) as Logged[]
  expect(requests.some((r) => r.path === `/store/carts/${cartId}` && r.body?.region_id === "reg_test")).toBe(false)
})

test("delivery to Slovakia is PPL in EUR, without clinic pickup", async ({ page, context }) => {
  await withCart(context, `cart_sk_${crypto.randomUUID()}`)
  await page.goto("/sk/checkout?step=delivery")
  const options = page.getByTestId("delivery-options-container")
  await expect(options).toContainText("Přepravce PPL – Slovensko")
  await expect(options).toContainText("8,00 €")
  await expect(options).not.toContainText("Pobočka Beauty Body Clinic")
})

test("the mobile menu offers the delivery country too", async ({ page, context, isMobile }) => {
  test.skip(!isMobile, "mobile menu")
  await withCart(context, `cart_test_${crypto.randomUUID()}`)
  await page.goto("/cz")
  const open = page.getByRole("button", { name: "Otevřít menu" })
  await waitForHydration(page, open)
  await open.click()
  const countries = page.getByRole("dialog", { name: "Menu" }).getByRole("navigation", { name: "Země doručení" })
  await expect(countries.locator('[aria-current="true"]')).toHaveText("Česko (Kč)")
  await expect(countries.getByRole("button", { name: "Slovensko (€)" })).toBeVisible()
})
