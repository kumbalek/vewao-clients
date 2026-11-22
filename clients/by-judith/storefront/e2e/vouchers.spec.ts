import { expect, test, type Page } from "@playwright/test"

// Gift vouchers (vewao-clients#52, vewao-platform#25): their items need no
// delivery, so a cart of vouchers alone skips the delivery step.
const MOCK = "http://localhost:9101"
const SHOP = "http://127.0.0.1:8101"

const useCart = (prefix: string) => async ({ context, request }: { context: import("@playwright/test").BrowserContext; request: import("@playwright/test").APIRequestContext }) => {
  await request.post(`${MOCK}/__reset`)
  await context.addCookies([
    { name: "_medusa_cart_id", value: `${prefix}_${crypto.randomUUID()}`, url: SHOP, sameSite: "Lax" },
    { name: "_medusa_cache_id", value: crypto.randomUUID(), url: SHOP, sameSite: "Lax" },
  ])
}

// Server-rendered radios ignore clicks until React hydrates them.
async function waitForHydration(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const element = document.querySelector(sel)
    return !!element && Object.keys(element).some((key) => key.startsWith("__reactFiber"))
  }, selector)
}

test.describe("a cart of vouchers alone", () => {
  test.beforeEach(useCart("cart_voucher"))

  // The mock backend's shipping options carry no free-delivery price rule, so the
  // free-delivery nudge is not exercised here; lib/util/shipping is unit-tested.
  test("goes from the cart straight to payment", async ({ page }) => {
    await page.goto("/cz/cart")
    await expect(page.getByText("Dárkový poukaz").first()).toBeVisible()
    await expect(page.getByTestId("checkout-button")).toHaveAttribute("href", /step=payment/)
  })

  test("saving the address leads to payment, not delivery", async ({ page }) => {
    await page.goto("/cz/checkout?step=address")
    const submit = page.getByTestId("submit-address-button")
    await waitForHydration(page, '[data-testid="submit-address-button"]')
    await submit.click()
    await expect(page).toHaveURL(/step=payment/)
    await expect(page.getByTestId("delivery-not-needed")).toContainText("pošleme e-mailem")
  })

  test("pays by Comgate and confirms the order delivered by e-mail", async ({ page }) => {
    await page.goto("/cz/checkout?step=payment")
    await expect(page.getByTestId("delivery-not-needed")).toBeVisible()
    await expect(page.getByTestId("delivery-options-container")).toHaveCount(0)
    await waitForHydration(page, '[role="radio"]')
    // Pay on site stays pickup-only: with nothing to pick up, only Comgate is offered.
    await expect(page.getByRole("radio")).toHaveCount(1)
    await page.getByRole("radio", { name: /Comgate/ }).click()
    await page.getByTestId("submit-payment-button").click()
    await expect(page).toHaveURL(/step=review/)
    await page.locator("#accept-agreement").click()
    await page.getByTestId("submit-order-button").click()
    await expect(page).toHaveURL(/^http:\/\/localhost:9101\/__comgate\/pay/)
    await page.getByRole("link", { name: "Zpět do obchodu" }).click()
    await expect(page).toHaveURL(/\/cz\/order\/[^/]+\/confirmed/)
    await expect(page.getByTestId("shipping-method-summary")).toContainText("E-mailem (dárkové poukazy)")
  })
})

test.describe("a voucher with goods", () => {
  test.beforeEach(useCart("cart_vouchermix"))

  test("still asks for delivery", async ({ page }) => {
    await page.goto("/cz/cart")
    await expect(page.getByTestId("checkout-button")).toHaveAttribute("href", /step=delivery/)
    await page.goto("/cz/checkout?step=delivery")
    await expect(page.getByTestId("delivery-options-container")).toBeVisible()
    await expect(page.getByTestId("delivery-not-needed")).toHaveCount(0)
  })
})

// The voucher picture (vewao-clients#70): the empty voucher with the product's
// name on it, tilted with a shadow like a printed card.
test("a voucher's product page shows the voucher card with its name", async ({ page }) => {
  await page.goto("/cz/products/darkovy-poukaz")

  const card = page.getByRole("img", { name: "Vstupní osobní diagnostika Judity Halvové" })
  await expect(card).toBeVisible()
  await expect(card.getByTestId("voucher-title")).toHaveText("Vstupní osobní diagnostika Judity Halvové")
  await expect(card).toContainText("Dárkový poukaz")
  const { transform, filter } = await card.locator("[style*='aspect-ratio']").evaluate((el) => ({
    transform: getComputedStyle(el).transform,
    filter: getComputedStyle(el.parentElement!).filter,
  }))
  expect(transform).not.toBe("none")
  expect(filter).toContain("drop-shadow")
})

test.describe("the voucher line in the cart", () => {
  test.beforeEach(useCart("cart_voucher"))

  test("shows the voucher card with the product's name", async ({ page }) => {
    await page.goto("/cz/cart")
    const row = page.getByTestId("product-row").filter({ has: page.getByTestId("voucher-image") })
    await expect(row.getByTestId("voucher-title")).toHaveText("Dárkový poukaz")
  })
})

// Ultherapy's single areas (vewao-clients#70): the options sit right under the
// description on a large screen and above the price on a phone, in Czech, each
// button as wide as its words. Several areas may be chosen; their prices add up
// and each one goes into the cart as its own voucher.
test.describe("Ultherapy's single areas", () => {
  test.beforeEach(useCart("cart_partie"))

  test("are in Czech, whole words, under the description on a large screen", async ({ page, isMobile }) => {
    await page.goto("/cz/products/ultherapy-aplikace-na-jednotlive-partie")
    const product = page.getByTestId("product-container")

    const options = product.getByTestId("product-options").filter({ visible: true })
    await expect(options).toHaveCount(1)
    await expect(product.getByText("Vyberte partie").filter({ visible: true })).toBeVisible()
    await expect(product.getByText("lze vybrat více").filter({ visible: true })).toBeVisible()
    const buttons = options.getByTestId("option-button")
    await expect(buttons).toHaveText(["Brow lift", "Brow lift a oční okolí", "Lower face", "Horní část krku/podbradek", "Krk", "Dekolt"])
    for (const button of await buttons.all()) {
      const whole = await button.evaluate((el) => getComputedStyle(el).whiteSpace === "nowrap" && el.scrollWidth <= el.clientWidth)
      expect(whole, (await button.textContent()) ?? "").toBe(true)
    }
    // Nothing chosen yet: the button asks for a choice instead of "sold out".
    await expect(product.getByTestId("add-product-button")).toHaveText("Vyberte variantu")

    const price = product.getByTestId("product-price").filter({ visible: true }).first()
    const [title, group, priceBox] = await Promise.all([
      product.getByTestId("product-title").boundingBox(),
      options.boundingBox(),
      price.boundingBox(),
    ])
    if (isMobile) {
      expect(group!.y + group!.height).toBeLessThanOrEqual(priceBox!.y)
    } else {
      expect(group!.y).toBeGreaterThan(title!.y + title!.height)
      expect(group!.x).toBeGreaterThan(priceBox!.x + priceBox!.width)
    }
  })

  test("several can be chosen; their prices add up and each goes into the cart", async ({ page }) => {
    await page.goto("/cz/products/ultherapy-aplikace-na-jednotlive-partie")
    const product = page.getByTestId("product-container")
    const buttons = product.getByTestId("product-options").filter({ visible: true }).getByTestId("option-button")
    const price = product.getByTestId("product-price").filter({ visible: true }).first()
    const add = product.getByTestId("add-product-button")

    await buttons.filter({ hasText: /^Krk$/ }).click()
    await expect(price).toContainText("15.000")
    await expect(add).toHaveText("Přidat do košíku")
    await buttons.filter({ hasText: /^Dekolt$/ }).click()
    await expect(buttons.filter({ hasText: /^Krk$/ })).toHaveAttribute("aria-pressed", "true")
    await expect(buttons.filter({ hasText: /^Dekolt$/ })).toHaveAttribute("aria-pressed", "true")
    await expect(price).toContainText("32.000")
    await expect(add).toHaveText("Přidat do košíku (2)")
    // A second press takes an area out again.
    await buttons.filter({ hasText: /^Brow lift$/ }).click()
    await buttons.filter({ hasText: /^Brow lift$/ }).click()
    await expect(price).toContainText("32.000")

    // The button waits while both areas are added, one after the other.
    await add.click()
    await expect(add).toBeDisabled()
    await expect(add).toBeEnabled({ timeout: 15_000 })
    const rows = page.getByTestId("product-row").filter({ hasText: "Aplikace na jednotlivé partie" })
    await expect
      .poll(async () => {
        await page.goto("/cz/cart")
        return rows.count()
      }, { timeout: 15_000 })
      .toBe(2)
    // Each line says which area it is.
    await expect(rows.getByTestId("product-variant")).toHaveText(["Krk", "Dekolt"])
  })
})
