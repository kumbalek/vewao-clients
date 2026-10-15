import { expect, test, type APIRequestContext, type Page } from "@playwright/test"

const MOCK = "http://127.0.0.1:9101"
const SHOP = "http://127.0.0.1:8101"

// The seed's legacy tiers, with the texts editors keep in admin.
const LEGACY_TIERS = [
  {
    code: "TIER_10", min_count: 1, type: "percentage", value: 10, currency_code: null,
    message: "🎉 Získáváte slevu 10 %!",
    teaser: "Kupte 1 balení a získáte 10 % slevu, 2 balení 20 %, 3+ balení 30 %!",
  },
  {
    code: "TIER_20", min_count: 2, type: "percentage", value: 20, currency_code: null,
    message: "🔥 Získáváte slevu 20 %!",
    teaser: "Kupte jakýkoliv další produkt a získáte 20 %.",
  },
  {
    code: "TIER_30", min_count: 3, type: "percentage", value: 30, currency_code: null,
    message: "🏆 Získáváte maximální slevu 30 %!",
    teaser: "Kupte jakýkoliv další produkt a získáte 30 %.",
  },
]

test.beforeEach(async ({ context, request }) => {
  await request.post(`${MOCK}/__reset`)
  await context.addCookies([
    { name: "_medusa_cart_id", value: `cart_test_${crypto.randomUUID()}`, url: SHOP, sameSite: "Lax" },
    { name: "_medusa_cache_id", value: crypto.randomUUID(), url: SHOP, sameSite: "Lax" },
  ])
})

async function setTiers(request: APIRequestContext, tiers: unknown[]) {
  await request.post(`${MOCK}/__promotion-tiers`, { data: { tiers } })
}

async function openCart(page: Page) {
  await page.goto("/cz/cart")
  await expect(page.getByTestId("cart-container")).toBeVisible()
}

test("shows no progress bar while no tier promotion is active", async ({ page }) => {
  await openCart(page)
  await expect(page.getByTestId("product-row")).toHaveCount(1)
  await expect(page.getByTestId("promotion-progress")).toHaveCount(0)
})

test("shows the admin texts for the reached and the next tier", async ({ page, request }) => {
  await setTiers(request, LEGACY_TIERS)
  await openCart(page)

  await expect(page.getByTestId("promotion-progress-text")).toHaveText(
    "🎉 Získáváte slevu 10 %! Kupte jakýkoliv další produkt a získáte 20 %."
  )
  const bar = page.getByRole("progressbar", { name: "Postup ke slevě za množství" })
  await expect(bar).toHaveAttribute("aria-valuenow", "1")
  await expect(bar).toHaveAttribute("aria-valuemax", "3")
})

test("falls back to default texts when admin leaves them empty", async ({ page, request }) => {
  await setTiers(request, [
    { code: "TIER_15", min_count: 2, type: "percentage", value: 15, currency_code: null, message: null, teaser: null },
  ])
  await openCart(page)
  await expect(page.getByTestId("promotion-progress-text")).toHaveText(
    "Přidejte ještě 1 ks a získáte slevu 15 %."
  )
})

test("gift packaging shows the backend price and does not count towards tiers", async ({ page, request }) => {
  await setTiers(request, LEGACY_TIERS)
  await openCart(page)

  const gift = page.getByTestId("gift-packaging")
  await expect(gift.getByTestId("gift-packaging-price")).toHaveText("199 Kč")
  const checkbox = gift.getByRole("checkbox", { name: "Dárkové balení" })
  await expect(checkbox).not.toBeChecked()
  await page.waitForFunction(
    () => {
      const input = document.querySelector("#gift-packaging")
      return !!input && Object.keys(input).some((key) => key.startsWith("__reactFiber"))
    }
  )

  // Controlled by the cart: it changes once the backend has the line.
  await checkbox.click()
  await expect(page.getByTestId("product-row")).toHaveCount(2)
  await expect(checkbox).toBeChecked()
  // Still one discountable item: the gift line is not counted.
  await expect(page.getByTestId("promotion-progress-text")).toHaveText(
    "🎉 Získáváte slevu 10 %! Kupte jakýkoliv další produkt a získáte 20 %."
  )

  await checkbox.click()
  await expect(page.getByTestId("product-row")).toHaveCount(1)
  await expect(checkbox).not.toBeChecked()
})
