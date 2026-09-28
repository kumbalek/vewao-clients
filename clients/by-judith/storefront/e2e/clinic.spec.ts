import { expect, test } from "@playwright/test"

const SHOP = "http://127.0.0.1:8101"

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: "_medusa_cache_id", value: crypto.randomUUID(), url: SHOP, sameSite: "Lax" },
  ])
})

test("O nás tells the clinic's story and shows the team in admin order", async ({ page }) => {
  await page.goto("/cz/o-nas")
  await expect(page.getByRole("heading", { level: 1, name: "O nás" })).toBeVisible()
  await expect(page.getByText("Perex o klinice.")).toBeVisible()
  await expect(page.getByText("Text o klinice.")).toBeVisible()

  const team = page.getByTestId("team-member")
  await expect(team.getByRole("heading", { level: 3 })).toHaveText([
    "Mgr. Testovací Terapeutka",
    "Jana Recepční",
  ])
  await expect(team.first().getByRole("img", { name: "Testovací terapeutka" })).toBeVisible()
  // Without a photo, a member shows a decorative monogram.
  await expect(team.nth(1)).toContainText("J")
  await expect(team.nth(1).getByRole("img")).toHaveCount(0)

  const bio = team.first()
  await expect(bio.getByText("Druhý odstavec medailonku.")).toBeHidden()
  await bio.getByText("Celý medailonek").click()
  await expect(bio.getByText("Druhý odstavec medailonku.")).toBeVisible()
})

test("a category lists its procedures, what it treats and its FAQ", async ({ page }) => {
  await page.goto("/cz/procedury/akupunktura")
  await expect(page.getByRole("heading", { level: 1, name: "Akupunktura" })).toBeVisible()
  await expect(page.getByText("Úvod kategorie.")).toBeVisible()

  const cards = page.getByTestId("procedure-card")
  await expect(cards.getByRole("heading", { level: 3 })).toHaveText(["Testovací procedura", "Druhá procedura"])
  await expect(cards.first()).toContainText("45 min · od 1.000 Kč")
  await expect(cards.first().getByRole("link", { name: "Rezervovat" })).toHaveAttribute("href", "/cz/content/contact")
  await expect(cards.first().getByRole("link", { name: "Detail" })).toHaveAttribute(
    "href",
    "/cz/procedury/akupunktura/testovaci-procedura"
  )

  await expect(page.getByRole("heading", { level: 2, name: "Na co se zaměřujeme?" })).toBeVisible()
  const faq = page.getByTestId("faq")
  await expect(faq.getByText("Většinou vůbec ne.")).toBeHidden()
  await faq.getByText("Bolí to?").click()
  await expect(faq.getByText("Většinou vůbec ne.")).toBeVisible()
})

test("a procedure shows its price list, booking and related procedures", async ({ page }) => {
  await page.goto("/cz/procedury/akupunktura/testovaci-procedura")
  await expect(page).toHaveTitle("Testovací procedura – Akupunktura")
  await expect(page.getByRole("heading", { level: 1, name: "Testovací procedura" })).toBeVisible()
  await expect(page.getByText("od 1.000 Kč")).toBeVisible()
  await expect(page.getByTestId("price-list").locator("dt")).toHaveText(["Jedno sezení", "Balíček 5 sezení"])
  await expect(page.getByTestId("price-list").locator("dd")).toHaveText(["1.000 Kč", "4.000 Kč"])
  await expect(page.getByRole("link", { name: "Rezervovat proceduru" })).toHaveAttribute("href", "/cz/content/contact")
  await expect(page.getByTestId("procedure-body").locator("strong")).toHaveText("procedury")

  // Content the source does not have yet is marked, not invented.
  await expect(page.getByText("Koupit jako poukaz")).toHaveAttribute("data-placeholder", "")
  await expect(page.getByRole("heading", { level: 2, name: "Přínosy" })).toBeVisible()

  await expect(page.getByTestId("faq")).toContainText("Bolí to?")
  const related = page.getByRole("region", { name: "Související procedury" })
  await expect(related.getByTestId("procedure-card")).toHaveCount(1)
  await expect(related).toContainText("Druhá procedura")
})

test("unknown categories and procedures outside their category are 404", async ({ page }) => {
  expect((await page.goto("/cz/procedury/neexistuje"))?.status()).toBe(404)
  // "cizi-procedura" belongs to another category.
  expect((await page.goto("/cz/procedury/akupunktura/cizi-procedura"))?.status()).toBe(404)
})
