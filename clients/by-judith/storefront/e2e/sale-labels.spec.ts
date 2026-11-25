import { expect as baseExpect, test, type APIRequestContext, type Page } from "@playwright/test"

import { NEEDS_PAYLOAD, SHOP, ensureDoc, hasPayload, payloadAuth } from "./support/payload"

const expect = baseExpect.configure({ timeout: 15_000 })
const MOCK = "http://127.0.0.1:9101"

// Sale labels (owner, 2026-11-22): texts in Payload ("Akce"), shown only while
// Medusa runs the sale (vewao-platform#49, mocked here).
test.skip(!hasPayload, NEEDS_PAYLOAD)
test.describe.configure({ mode: "serial" })

const HERBS = { code: "E2E-HERBS-2PLUS1", label: "2 + 1 ZDARMA", description: "Třetí bylinka zdarma.", categories: ["herbs"], showInCart: true }
const PRICE_LIST = { code: "E2E Vánoční ceny", label: "Vánoční ceny", description: "Poukazy za vánoční ceny.", categories: [], showInCart: true }

const running = (request: APIRequestContext, sales: { promotions?: string[]; price_lists?: string[] }) =>
  request.post(`${MOCK}/__active-sales`, { data: sales })

const cartCookie = (value: string) => ({ name: "_medusa_cart_id", value, url: SHOP, sameSite: "Lax" as const })

/**
 * Opens `url` until `check` passes. After its cache window (1 s in these
 * tests) the shop answers once from the old entry while it asks Medusa again,
 * so the first look can still show what an earlier spec left running.
 */
async function lookUntil(page: Page, url: string, check: () => Promise<void>) {
  await expect(async () => {
    await page.goto(url)
    await check()
  }).toPass()
}

test.describe("sale labels", () => {
  test.beforeEach(async ({ isMobile, request }) => {
    test.skip(isMobile, "CMS flow runs once")
    await request.post(`${MOCK}/__reset`)
    await running(request, { promotions: [HERBS.code], price_lists: [PRICE_LIST.code] })
  })

  test.beforeAll(async ({ request }) => {
    const auth = await payloadAuth(request)
    for (const sale of [HERBS, PRICE_LIST]) {
      const { code, ...data } = sale
      await ensureDoc(request, auth, "sales", "code", code, data)
    }
  })

  test("a running sale's label sits beside the title of its category and its subcategories", async ({ page }) => {
    const label = page.getByTestId("category-container").getByTestId("sale-label")
    await lookUntil(page, "/cz/categories/herbs", () => expect(label).toHaveCount(1, { timeout: 2_000 }))
    await expect(label).toContainText("2 + 1 ZDARMA")
    // The description is behind the "i".
    await expect(label.getByRole("button", { name: "Podrobnosti akce" })).toBeVisible()

    await page.goto("/cz/categories/gold-edition")
    await expect(page.getByTestId("category-container").getByTestId("sale-label")).toContainText("2 + 1 ZDARMA")

    await page.goto("/cz/categories/dp-dermaceuticals")
    await expect(page.getByTestId("category-page-title")).toBeVisible()
    await expect(page.getByTestId("sale-label")).toHaveCount(0)
  })

  test("on a product of the category the label sits under the title, before the description", async ({ page }) => {
    const product = page.getByTestId("product-container")
    const label = product.getByTestId("sale-label")
    await lookUntil(page, "/cz/products/akcni-produkt", () => expect(label).toContainText("2 + 1 ZDARMA", { timeout: 2_000 }))
    await expect(label).toContainText("Třetí bylinka zdarma.")

    const [title, box, description] = await Promise.all([
      product.getByTestId("product-title").boundingBox(),
      label.boundingBox(),
      product.getByTestId("product-description").boundingBox(),
    ])
    expect(box!.y).toBeGreaterThan(title!.y)
    expect(box!.y).toBeLessThan(description!.y)
  })

  test("an ended sale loses its labels", async ({ page, request }) => {
    await running(request, { promotions: [], price_lists: [PRICE_LIST.code] })
    // The shop asks Medusa again after its cache window (1 s in these tests).
    await lookUntil(page, "/cz/categories/herbs", async () => {
      await expect(page.getByTestId("category-page-title")).toBeVisible()
      await expect(page.getByTestId("sale-label")).toHaveCount(0, { timeout: 1_000 })
    })
  })

  test("the cart lists the sales it gets under its summary", async ({ page, context, request }) => {
    // The cart applies the 2 + 1.
    const promoted = `cart_test_${crypto.randomUUID()}`
    await request.post(`${MOCK}/__cart/seed`, { data: { cartId: promoted, promotions: [{ id: "promo_e2e", code: HERBS.code, is_automatic: true }] } })
    await context.addCookies([cartCookie(promoted)])
    const sales = page.getByTestId("active-sales")
    await lookUntil(page, "/cz/cart", () => expect(sales.getByRole("heading", { name: "Aktivní slevy" })).toBeVisible({ timeout: 2_000 }))
    await expect(sales.getByTestId("sale-label")).toHaveCount(1)
    await expect(sales.getByTestId("sale-label")).toContainText("Třetí bylinka zdarma.")

    // A voucher on its sale price: the running price list.
    const voucher = `cart_voucher_${crypto.randomUUID()}`
    const { cart } = await (await request.post(`${MOCK}/__cart/seed`, { data: { cartId: voucher } })).json()
    await request.post(`${MOCK}/__cart/seed`, {
      data: { cartId: voucher, items: [{ ...cart.items[0], unit_price: 800, total: 800, original_total: 800, compare_at_unit_price: 1000 }] },
    })
    await context.addCookies([cartCookie(voucher)])
    await page.goto("/cz/cart")
    await expect(sales.getByTestId("sale-label")).toHaveCount(1)
    await expect(sales.getByTestId("sale-label")).toContainText("Vánoční ceny")

    // Nothing applied: no section.
    await context.addCookies([cartCookie(`cart_test_${crypto.randomUUID()}`)])
    await page.goto("/cz/cart")
    await expect(page.getByTestId("cart-container")).toBeVisible()
    await expect(page.getByTestId("active-sales")).toHaveCount(0)
  })
})
