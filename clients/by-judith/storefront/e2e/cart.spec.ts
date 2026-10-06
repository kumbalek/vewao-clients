import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test"

const MOCK = "http://127.0.0.1:9101"
const SHOP = "http://127.0.0.1:8101"

function cartCookie(value: string) {
  return { name: "_medusa_cart_id", value, url: SHOP, sameSite: "Lax" as const }
}

test.beforeEach(async ({ context, request }) => {
  await request.post(`${MOCK}/__reset`)
  await context.addCookies([
    cartCookie(`cart_test_${crypto.randomUUID()}`),
    {
      name: "_medusa_cache_id",
      value: crypto.randomUUID(),
      url: SHOP,
      sameSite: "Lax",
    },
  ])
})

async function setCartControls(
  request: APIRequestContext,
  controls: { status?: number; message?: string; delayMs?: number }
) {
  await request.post(`${MOCK}/__cart/controls`, { data: controls })
}

async function openCart(page: Page) {
  await page.goto("/cz/cart")
  await expect(page.getByTestId("cart-container")).toBeVisible()
  await page.waitForFunction(() => {
    const select = document.querySelector(
      '[data-testid="product-select-button"]'
    )
    return (
      !!select &&
      Object.keys(select).some((key) => key.startsWith("__reactFiber"))
    )
  })
}

async function expectTotals(
  page: Page,
  expected: {
    subtotal: number
    shipping: number
    total: number
    discount?: number
  }
) {
  const container = page.getByTestId("cart-container")
  await expect(container.getByTestId("cart-subtotal")).toHaveAttribute(
    "data-value",
    String(expected.subtotal)
  )
  await expect(container.getByTestId("cart-shipping")).toHaveAttribute(
    "data-value",
    String(expected.shipping)
  )
  await expect(container.getByTestId("cart-total")).toHaveAttribute(
    "data-value",
    String(expected.total)
  )
  if (expected.discount !== undefined) {
    await expect(container.getByTestId("cart-discount")).toHaveAttribute(
      "data-value",
      String(expected.discount)
    )
  } else {
    await expect(container.getByTestId("cart-discount")).toHaveCount(0)
  }
}

test("updates quantity and shows backend totals", async ({ page }) => {
  await openCart(page)

  const select = page.getByTestId("product-select-button")
  await expect(select).toHaveValue("1")
  await select.selectOption("2")

  await expect(select).toBeDisabled()
  await expect(select).toHaveValue("2")
  await expect(select).toBeEnabled()
  await expect(
    page.getByTestId("product-row").getByTestId("product-price")
  ).toHaveText(/980/)
  await expectTotals(page, { subtotal: 980, shipping: 150, total: 1130 })
})

test("represents a larger existing quantity without a fake stock limit", async ({
  page,
  context,
  request,
}) => {
  const cartId = `cart_test_${crypto.randomUUID()}`
  await request.post(`${MOCK}/__cart/seed`, { data: { cartId, quantity: 25 } })
  await context.addCookies([cartCookie(cartId)])
  await openCart(page)

  const select = page.getByTestId("product-select-button")
  await expect(select).toHaveValue("25")
  await expect(
    page.getByTestId("product-row").getByTestId("product-price")
  ).toHaveText(/12[.\s]?250/)
  await expectTotals(page, { subtotal: 12250, shipping: 0, total: 12250 })
})

test("removes the last item and shows the empty cart", async ({ page }) => {
  await openCart(page)

  await page.getByTestId("product-delete-button").click()
  await expect(page.getByTestId("empty-cart-message")).toBeVisible()
  await expect(page.getByTestId("product-row")).toHaveCount(0)
})

test("adds an item from a product page", async ({ page }) => {
  await page.goto("/cz/products/akcni-produkt")
  await page.getByTestId("add-product-button").click()
  await expect(page.getByTestId("add-product-button")).toBeDisabled()
  await expect(page.getByTestId("add-product-button")).toBeEnabled()

  await page.goto("/cz/cart")
  await expect(page.getByTestId("product-row")).toHaveCount(2)
  const saleRow = page
    .getByTestId("product-row")
    .filter({ hasText: "Akční produkt" })
  await expect(saleRow.getByTestId("product-price")).toHaveText(/1[.\s]?490/)
  await expectTotals(page, { subtotal: 1980, shipping: 150, total: 2130 })
})

test("shows a Czech error and lets the customer retry a quantity update", async ({
  page,
  request,
}) => {
  await setCartControls(request, {
    status: 500,
    message: "Aktualizace košíku se nepodařila.",
  })
  await openCart(page)

  const select = page.getByTestId("product-select-button")
  await select.selectOption("3")
  await expect(page.getByTestId("product-error-message")).toHaveText(
    "Aktualizace množství se nepodařila. Zkuste to prosím znovu."
  )
  await expect(select).toHaveValue("1")

  await setCartControls(request, { status: 200 })
  await select.selectOption("3")
  await expect(page.getByTestId("product-error-message")).toHaveCount(0)
  await expect(
    page.getByTestId("product-row").getByTestId("product-price")
  ).toHaveText(/1[.\s]?470/)
})

test("shows a Czech error and lets the customer retry a delete", async ({
  page,
  request,
}) => {
  await setCartControls(request, {
    status: 500,
    message: "Odebrání položky se nepodařilo.",
  })
  await openCart(page)

  await page.getByTestId("product-delete-button").click()
  await expect(
    page.getByTestId("cart-container").getByRole("alert")
  ).toHaveText("Odebrání položky se nepodařilo. Zkuste to prosím znovu.")
  await expect(page.getByTestId("product-row")).toHaveCount(1)

  await setCartControls(request, { status: 200 })
  await page.getByTestId("product-delete-button").click()
  await expect(page.getByTestId("empty-cart-message")).toBeVisible()
})

test("keeps quantity and delete controls busy during mutations", async ({
  page,
  request,
}) => {
  await setCartControls(request, { delayMs: 300 })
  await openCart(page)

  await page.getByTestId("product-select-button").selectOption("2")
  await expect(page.getByTestId("product-select-button")).toBeDisabled()
  await expect(page.getByTestId("product-delete-button")).toBeDisabled()
  await expect(page.getByTestId("product-select-button")).toBeEnabled()
  await expect(page.getByTestId("product-delete-button")).toBeEnabled()

  await setCartControls(request, { delayMs: 300 })
  await page.getByTestId("product-delete-button").click()
  await expect(page.getByTestId("product-delete-button")).toBeDisabled()
  await expect(page.getByTestId("product-select-button")).toBeDisabled()
  await expect(page.getByTestId("empty-cart-message")).toBeVisible()
})

test("names the quantity and delete controls for keyboard users", async ({
  page,
}) => {
  await openCart(page)

  await expect(
    page.getByRole("combobox", { name: /Množství produktu Testovací produkt/ })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: /Odebrat Testovací produkt/ })
  ).toBeVisible()
})

test("updates and removes by keyboard with cross-row busy state", async ({
  page,
  request,
}) => {
  await setCartControls(request, { delayMs: 200 })
  await openCart(page)

  const select = page.getByTestId("product-select-button")
  await select.focus()
  await expect(select).toBeFocused()
  await select.press("2")
  await select.press("Tab")
  await expect(select).toBeDisabled()
  await expect(page.getByTestId("product-delete-button")).toBeDisabled()
  await expect(select).toBeEnabled()
  await expect(page.getByTestId("product-delete-button")).toBeEnabled()
  await expect(select).toHaveValue("2")

  await page.getByTestId("product-delete-button").focus()
  await page.keyboard.press("Enter")
  await expect(page.getByTestId("product-delete-button")).toBeDisabled()
  await expect(select).toBeDisabled()
  await expect(page.getByTestId("empty-cart-message")).toBeVisible()
})

test("shows pickup, free PPL and discounted totals returned by the backend", async ({
  page,
  context,
  request,
}) => {
  const cases = [
    {
      cart: `cart_pickup_${crypto.randomUUID()}`,
      subtotal: 490,
      shipping: 0,
      total: 490,
    },
    {
      cart: `cart_freeppl_${crypto.randomUUID()}`,
      subtotal: 490,
      shipping: 0,
      total: 490,
    },
    {
      cart: `cart_discount_${crypto.randomUUID()}`,
      subtotal: 490,
      shipping: 150,
      total: 540,
      discount: 100,
    },
  ]

  for (const caseData of cases) {
    await request.post(`${MOCK}/__reset`)
    await context.addCookies([cartCookie(caseData.cart)])
    await request.post(`${MOCK}/__cart/seed`, {
      data: { cartId: caseData.cart },
    })
    await openCart(page)
    await expectTotals(page, caseData)
  }
})
