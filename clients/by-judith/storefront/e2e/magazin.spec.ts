import { expect, test } from "@playwright/test"

const SHOP = "http://127.0.0.1:8101"

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: "_medusa_cache_id", value: crypto.randomUUID(), url: SHOP, sameSite: "Lax" },
  ])
})

test("the magazine features the newest article and lists the rest", async ({ page }) => {
  await page.goto("/cz/magazin")
  await expect(page.getByRole("heading", { level: 1, name: "Magazín" })).toBeVisible()

  const featured = page.getByTestId("featured-article")
  await expect(featured.getByRole("link", { name: "Rozhovor s testovací klientkou" })).toHaveAttribute(
    "href",
    "/cz/magazin/rozhovor-s-testovaci-klientkou"
  )
  await expect(featured).toContainText("Doporučeno · Akupunktura")

  const cards = page.getByTestId("article-card")
  await expect(cards).toHaveCount(2)
  // Without a perex, a card teases the start of the article as plain text.
  await expect(cards.first()).toContainText("O bylinách")
  await expect(cards.first()).toContainText("Byliny pomáhají.")

  const topics = page.getByRole("navigation", { name: "Témata" })
  await expect(topics.getByRole("link", { name: "Vše" })).toHaveAttribute("aria-current", "page")
  await expect(topics.getByRole("link")).toHaveText(["Vše", "Akupunktura", "Fytoterapie"])
})

test("a topic narrows the list and is marked current", async ({ page }) => {
  await page.goto("/cz/magazin")
  const topics = page.getByRole("navigation", { name: "Témata" })
  await topics.getByRole("link", { name: "Fytoterapie" }).click()

  await expect(page).toHaveURL(/\/cz\/magazin\?tag=fytoterapie$/)
  await expect(topics.getByRole("link", { name: "Fytoterapie" })).toHaveAttribute("aria-current", "page")
  await expect(page.getByTestId("featured-article")).toHaveCount(0)
  await expect(page.getByTestId("article-card")).toHaveCount(1)
  await expect(page.getByTestId("article-card")).toContainText("Akupunktura v praxi")
})

test("an article shows its text, image and related reads", async ({ page }) => {
  await page.goto("/cz/magazin/rozhovor-s-testovaci-klientkou")
  await expect(page).toHaveTitle("Rozhovor s testovací klientkou")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Rozhovor s testovací klientkou")
  await expect(page.getByRole("img", { name: "Testovací fotografie" })).toBeVisible()

  const body = page.getByTestId("article-body")
  await expect(body.locator("strong").first()).toHaveText("Jak jste se k nám dostala?")
  await expect(body.getByRole("link", { name: "doporučení" })).toHaveAttribute("rel", /noopener/)

  // No newsletter provider yet: the sign-up is a marked placeholder, not a fake form.
  const newsletter = page.getByRole("complementary", { name: "Chcete zasílat magazín?" })
  await expect(newsletter.locator("[data-placeholder]")).toHaveCount(1)
  await expect(newsletter.getByRole("textbox")).toHaveCount(0)

  // An article sharing the "akupunktura" tag comes first.
  const related = page.getByRole("region", { name: "Související články" })
  await expect(related.getByTestId("article-card").first()).toContainText("Akupunktura v praxi")
})

test("an unknown article is a 404", async ({ page }) => {
  const response = await page.goto("/cz/magazin/neexistuje")
  expect(response?.status()).toBe(404)
})

test("the header links to the magazine", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop navigation")
  await page.goto("/cz")
  await page.getByRole("navigation", { name: "Hlavní navigace" }).getByRole("link", { name: "Magazín" }).click()
  await expect(page).toHaveURL(/\/cz\/magazin$/)
})
