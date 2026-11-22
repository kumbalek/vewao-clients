import { expect, test } from "@playwright/test"

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
  await expect(main.getByRole("link", { name: "Gold Edition" })).toHaveAttribute("href", "/cz/categories/gold-edition")
  await expect(main.getByRole("link", { name: /Akční produkt/ }).first()).toHaveAttribute(
    "href",
    "/cz/products/akcni-produkt"
  )
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

test("the product list links the categories", async ({ page }) => {
  await page.goto("/cz/store")

  const categories = page.getByTestId("store-categories")
  await expect(categories).toContainText("Kategorie:")
  await expect(categories.getByRole("link", { name: "Herbs" })).toHaveAttribute("href", "/cz/categories/herbs")
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
