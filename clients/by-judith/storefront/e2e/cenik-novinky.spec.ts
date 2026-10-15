import { expect, test } from "@playwright/test"

const MOCK = "http://127.0.0.1:9101"
const SHOP = "http://127.0.0.1:8101"

// Navigations from the landing page wait for `next dev` to compile the target.
const NAVIGATION = { timeout: 15_000 }

test.use({ reducedMotion: "reduce" })

test.beforeEach(async ({ context, request }) => {
  await request.post(`${MOCK}/__reset`)
  await context.addCookies([
    { name: "_medusa_cart_id", value: `cart_test_${crypto.randomUUID()}`, url: SHOP, sameSite: "Lax" },
    { name: "_medusa_cache_id", value: crypto.randomUUID(), url: SHOP, sameSite: "Lax" },
  ])
})

test("Ceník lists every priced procedure by category with links", async ({ page }) => {
  await page.goto("/cz/cenik")
  await expect(page.getByRole("heading", { name: "Ceník", level: 1 })).toBeVisible()

  const sections = page.getByTestId("price-list-section")
  await expect(sections).toHaveCount(1)
  const section = sections.first()
  await expect(section.getByRole("heading", { name: "Akupunktura", level: 2 })).toBeVisible()
  // Druhá procedura has no price; the beauty procedure has no category here.
  await expect(section.getByRole("heading", { level: 3 })).toHaveText(["Testovací procedura"])
  await expect(section.getByRole("link", { name: "Testovací procedura" })).toHaveAttribute(
    "href",
    "/cz/procedury/akupunktura/testovaci-procedura"
  )
  await expect(section.getByRole("term")).toHaveText(["Jedno sezení", "Balíček 5 sezení"])
  await expect(section.getByRole("definition")).toHaveText(["1.000 Kč", "4.000 Kč"])
})

test("Novinky shows current posts pinned first and the products on sale", async ({ page }) => {
  await page.goto("/cz/novinky")
  await expect(page.getByRole("heading", { name: "Novinky a slevy", level: 1 })).toBeVisible()

  const cards = page.getByTestId("news-card")
  // The expired offer is gone; the pinned post leads.
  await expect(cards.getByRole("heading", { level: 3 })).toHaveText([
    "Nová procedura v nabídce",
    "Podzimní sleva",
  ])
  await expect(
    cards.first().getByRole("link", { name: "Více informací: Nová procedura v nabídce" })
  ).toHaveAttribute("href", "/cz/procedury/akupunktura/testovaci-procedura")
  await expect(cards.nth(1).getByText("Platí do 31. 12. 2099")).toBeVisible()
  await expect(
    cards.nth(1).getByRole("link", { name: "Více informací: Podzimní sleva" })
  ).toHaveAttribute("href", "https://example.com/akce")

  const sale = page.getByTestId("sale-products")
  await expect(page.getByRole("heading", { name: "Zlevněné produkty", level: 2 })).toBeVisible()
  await expect(sale.getByText("Akční produkt")).toBeVisible()
})

test("the header links to Ceník and Novinky", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop navigation")
  await page.goto("/cz/magazin")
  const nav = page.getByRole("navigation", { name: "Hlavní navigace" })
  await expect(nav.getByRole("link", { name: "Ceník" })).toHaveAttribute("href", "/cz/cenik")
  await nav.getByRole("link", { name: "Novinky a slevy" }).click()
  await expect(page).toHaveURL(/\/cz\/novinky$/, NAVIGATION)
})
