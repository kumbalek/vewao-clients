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
