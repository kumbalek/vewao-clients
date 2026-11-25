import { expect as baseExpect, test } from "@playwright/test"

// The add-to-cart control (vewao-clients#75): big on the product page, small on
// product cards; the count is the whole product, minus takes the latest line.

const MOCK = "http://127.0.0.1:9101"
const SHOP = "http://127.0.0.1:8101"

// Each step waits on a cart server action and the refresh after it.
const expect = baseExpect.configure({ timeout: 15_000 })

test.beforeEach(async ({ context, request }) => {
  await request.post(`${MOCK}/__reset`)
  await context.addCookies([
    { name: "_medusa_cart_id", value: `cart_test_${crypto.randomUUID()}`, url: SHOP, sameSite: "Lax" },
    { name: "_medusa_cache_id", value: crypto.randomUUID(), url: SHOP, sameSite: "Lax" },
  ])
})

test("on a product page: add, add another, then minus back to the start", async ({ page }) => {
  await page.goto("/cz/products/akcni-produkt")
  // The disabled Suspense fallback and the streamed actions coexist briefly (as in cart.spec.ts).
  await expect(page.getByTestId("add-to-cart")).toHaveCount(1)
  const control = page.getByTestId("add-to-cart")
  const add = control.getByTestId("add-product-button")
  const minus = control.getByRole("button", { name: "Odebrat jeden kus" })

  await expect(add).toHaveText("Přidat do košíku")
  await expect(control).toHaveAttribute("data-quantity", "0")
  // Nothing to take away: the minus is hidden from everyone, not just greyed out.
  await expect(minus).toHaveCount(0)
  const fullWidth = (await add.boundingBox())!.width

  await add.click()
  await expect(control).toHaveAttribute("data-quantity", "1")
  await expect(add).toHaveText("Přidat další")
  await expect(control.getByTestId("cart-quantity")).toHaveText("1")
  await expect(minus).toBeEnabled()
  // The button gives up room to the count and minus beside it.
  await expect.poll(async () => (await add.boundingBox())!.width).toBeLessThan(fullWidth - 40)

  await add.click()
  await expect(control).toHaveAttribute("data-quantity", "2")
  await expect(page.getByTestId("nav-cart-count").first()).toHaveText("3")

  await minus.click()
  await expect(control).toHaveAttribute("data-quantity", "1")
  await minus.click()
  await expect(control).toHaveAttribute("data-quantity", "0")
  await expect(add).toHaveText("Přidat do košíku")
  await expect(minus).toHaveCount(0)

  // The line is gone; the cart's other item stays.
  await page.goto("/cz/cart")
  await expect(page.getByTestId("product-row")).toHaveCount(1)
  await expect(page.getByTestId("product-row").filter({ hasText: "Akční produkt" })).toHaveCount(0)
})

test("a product card adds its one variant and takes it out again, without leaving the list", async ({ page }) => {
  await page.goto("/cz/categories/herbs")
  const card = page.getByTestId("product-card").filter({ hasText: "Akční produkt" }).first()
  const control = card.getByTestId("card-add-to-cart")

  await expect(control).toHaveAttribute("data-quantity", "0")
  await card.getByRole("button", { name: "Přidat do košíku: Akční produkt" }).click()
  await expect(control).toHaveAttribute("data-quantity", "1")
  await expect(control.getByTestId("cart-quantity")).toHaveText("1")
  await expect(page).toHaveURL(/\/cz\/categories\/herbs$/)

  // The product page counts the same.
  await page.goto("/cz/products/akcni-produkt")
  await expect(page.getByTestId("add-to-cart")).toHaveCount(1)
  await expect(page.getByTestId("add-to-cart")).toHaveAttribute("data-quantity", "1")
  await page.goBack()

  await card.getByRole("button", { name: "Odebrat jeden kus: Akční produkt" }).click()
  await expect(control).toHaveAttribute("data-quantity", "0")
  // The card itself still leads to the product.
  await expect(card.getByRole("link", { name: /Akční produkt/ }).first()).toHaveAttribute("href", "/cz/products/akcni-produkt")
})

test("a product with a choice shows an i that explains it and leads to the product page", async ({ page }) => {
  await page.goto("/cz/store?q=partie")
  const card = page.getByTestId("product-card").filter({ hasText: "Aplikace na jednotlivé partie" }).first()
  const link = card.getByRole("link", { name: "Vybrat variantu: Aplikace na jednotlivé partie" })
  const note = card.getByRole("tooltip")

  await expect(card.getByTestId("card-add-to-cart")).toHaveCount(0)
  await expect(link).toHaveAccessibleDescription("Produkt má více variant, vyberte na detailu.")
  await expect(note).toBeHidden()

  // The card is server-rendered: CSS shows the note on focus at once, but Escape
  // is React's to handle, so wait until React has hydrated the link (CI, main run
  // of 2026-11-25).
  await page.waitForFunction(
    (element) => !!element && Object.keys(element).some((key) => key.startsWith("__reactFiber")),
    await link.elementHandle()
  )
  await link.focus()
  await expect(note).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(note).toBeHidden()

  await link.click()
  await expect(page).toHaveURL(/\/cz\/products\/ultherapy-aplikace-na-jednotlive-partie$/)
})
