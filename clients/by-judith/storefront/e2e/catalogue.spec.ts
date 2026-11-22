import { expect, test } from "@playwright/test"

const MOCK = "http://127.0.0.1:9101"

// Categories replace the collections (vewao-clients#67). The mock backend's
// sale product is a herb in Herbs › Gold Edition; TCM and DP have no products.

test("the shop front has a rail per category with products, none for empty ones", async ({ page }) => {
  await page.goto("/cz/shop")

  const rails = page.getByTestId("category-rail")
  await expect(rails).toHaveCount(1)
  await expect(rails.first()).toContainText("Herbs")
  await expect(rails.first().getByRole("link", { name: /Akční produkt/ }).first()).toHaveAttribute(
    "href",
    "/cz/products/akcni-produkt"
  )
  await expect(page.getByRole("main").getByText("TCM", { exact: true })).toHaveCount(0)
})

test("a category page lists its subcategories and their products", async ({ page }) => {
  await page.goto("/cz/categories/herbs")

  await expect(page.getByTestId("category-page-title")).toHaveText("Herbs")
  const main = page.getByRole("main")
  // A category box with the subcategory's subtitle and image (vewao-clients#70).
  const gold = main.getByTestId("subcategories").getByRole("link", { name: /^Gold Edition/ })
  await expect(gold).toHaveAttribute("href", "/cz/categories/gold-edition")
  await expect(gold).toContainText("Zlatá řada")
  await expect(gold.locator("img")).toHaveAttribute("src", "/logo.webp")
  await expect(main.getByRole("link", { name: /Akční produkt/ }).first()).toHaveAttribute(
    "href",
    "/cz/products/akcni-produkt"
  )
})

test("a category's subcategory boxes stack on a phone and sit in a row on a large screen", async ({ page, isMobile }) => {
  await page.goto("/cz/categories/dp-dermaceuticals")

  const boxes = page.getByRole("main").getByTestId("subcategories").getByRole("link")
  await expect(boxes).toHaveText(["Čištění a exfoliace", "DP Masky"])
  const [first, second] = await Promise.all([boxes.nth(0).boundingBox(), boxes.nth(1).boundingBox()])
  if (isMobile) {
    expect(Math.abs(first!.x - second!.x)).toBeLessThan(2)
    expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height)
  } else {
    expect(Math.abs(first!.y - second!.y)).toBeLessThan(2)
    expect(second!.x).toBeGreaterThan(first!.x + first!.width)
  }
})

test("a category page shows its call to action beside the title and subtitle", async ({ page, isMobile }) => {
  await page.goto("/cz/categories/herbs")

  const title = page.getByTestId("category-page-title")
  const subtitle = page.getByTestId("category-description")
  const cta = page.getByTestId("category-cta")
  await expect(cta).toHaveText("Objednat konzultaci")
  await expect(cta).toHaveAttribute("href", "/cz/kontakt")
  // The title is 15 % above text-2xl (24 px), the subtitle close under it.
  expect(await title.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeCloseTo(27.6, 0)
  const [t, s, c] = await Promise.all([title.boundingBox(), subtitle.boundingBox(), cta.boundingBox()])
  expect(s!.y - (t!.y + t!.height)).toBeLessThanOrEqual(12)
  if (isMobile) {
    expect(c!.y).toBeGreaterThanOrEqual(s!.y + s!.height)
  } else {
    expect(c!.x).toBeGreaterThan(Math.max(t!.x + t!.width, s!.x + s!.width))
    expect(c!.y).toBeLessThan(s!.y + s!.height)
    expect(c!.y + c!.height).toBeGreaterThan(t!.y)
  }

  // A category without one has no button.
  await page.goto("/cz/categories/dp-dermaceuticals")
  await expect(page.getByTestId("category-page-title")).toHaveText("DP Dermaceuticals")
  await expect(page.getByTestId("category-cta")).toHaveCount(0)
})

test("category pages have the product page's breadcrumbs, and the title stays put", async ({ page }) => {
  await page.goto("/cz/categories/herbs")
  const crumbs = page.getByTestId("category-breadcrumbs")
  await expect(crumbs.getByRole("link")).toHaveText(["Hlavní stránka"])
  const top = (await page.getByTestId("category-page-title").boundingBox())!.y

  await page.goto("/cz/categories/gold-edition")
  await expect(crumbs.getByRole("link")).toHaveText(["Hlavní stránka", "Herbs"])
  await expect(crumbs.getByRole("link", { name: "Herbs" })).toHaveAttribute("href", "/cz/categories/herbs")
  await expect(page.getByTestId("category-page-title")).toHaveText("Gold Edition")
  expect((await page.getByTestId("category-page-title").boundingBox())!.y).toBeCloseTo(top, 0)
})

test("a product's breadcrumb is its category path", async ({ page }) => {
  await page.goto("/cz/products/akcni-produkt")

  const main = page.getByRole("main")
  await expect(main.getByRole("link", { name: "Herbs", exact: true })).toHaveAttribute("href", "/cz/categories/herbs")
  await expect(main.getByRole("link", { name: "Gold Edition", exact: true })).toHaveAttribute(
    "href",
    "/cz/categories/gold-edition"
  )
  await expect(main.getByText(/Kolekce/)).toHaveCount(0)
})

test("the list of all products is gone; its address leads to the e-shop's front page and serves search", async ({ page, request }) => {
  // Categories replaced it (owner, 2026-11-22).
  const response = await request.get("/cz/store", { maxRedirects: 0 })
  expect(response.status()).toBe(308)
  expect(response.headers().location).toBe("/cz/shop")

  await page.goto("/cz/store?q=akční")
  await expect(page.getByTestId("store-page-title")).toContainText("akční")
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Všechny produkty" })).toHaveCount(0)

  await page.goto("/cz/products/akcni-produkt")
  await expect(page.getByRole("main").getByRole("link", { name: "Všechny produkty" })).toHaveCount(0)
})

test("the old collection addresses redirect to the herb subcategories", async ({ request }) => {
  for (const [from, to] of [
    ["/cz/collections/gold", "/cz/categories/gold-edition"],
    ["/sk/collections/acute", "/sk/categories/acute"],
  ]) {
    const response = await request.get(from, { maxRedirects: 0 })
    expect(response.status(), from).toBe(308)
    expect(response.headers().location, from).toBe(to)
  }
})

test("a price changed in admin reaches the product page within the cache window", async ({ page, request }) => {
  await request.post(`${MOCK}/__reset`)
  await page.goto("/sk/products/akcni-produkt")
  await expect(page.getByTestId("product-price").first()).toContainText("59,90 €")

  await request.post(`${MOCK}/__catalogue/price`, { data: { variant: "variant_sale", amount: 49.9, original: 75.9 } })
  // The test server keeps catalogue data 1 s (CATALOGUE_REVALIDATE_SECONDS); a
  // request after that serves the old copy once and refreshes it.
  await expect
    .poll(
      async () => {
        await page.reload()
        return page.getByTestId("product-price").first().textContent()
      },
      { timeout: 20_000, intervals: [1_500] }
    )
    .toContain("49,90 €")

  // Restore the price and wait until the shop shows it: the next spec must not
  // get this test's price from the cache.
  await request.post(`${MOCK}/__reset`)
  await expect
    .poll(
      async () => {
        await page.reload()
        return page.getByTestId("product-price").first().textContent()
      },
      { timeout: 20_000, intervals: [1_500] }
    )
    .toContain("59,90 €")
})
