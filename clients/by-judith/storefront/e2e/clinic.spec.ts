import { expect, test } from "@playwright/test"

import { NEEDS_PAYLOAD, SHOP, hasPayload } from "./support/payload"

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

// Procedures come from the CMS (#43): fixtures in e2e/cms.setup.ts.
test.describe("procedures", () => {
  test.skip(!hasPayload, NEEDS_PAYLOAD)

  test("a category shows its text, then its procedures with their annotations", async ({ page }) => {
    await page.goto("/cz/vychodni-medicina")
    await expect(page).toHaveTitle("Tradiční čínská medicína Praha | By JuditH")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tradiční čínská medicína")
    await expect(page.getByRole("heading", { level: 2, name: "Jak východní medicína pomáhá?" })).toBeVisible()

    const cards = page.getByTestId("procedure-card")
    await expect(cards.getByRole("heading", { level: 3 })).toHaveText(["Testovací procedura", "Druhá procedura"])
    const first = cards.first()
    await expect(first).toContainText("Anotace testovací procedury.")
    await expect(first).toContainText("45 min · od 1.000 Kč")
    await expect(first.getByRole("link", { name: "Testovací procedura", exact: true })).toHaveAttribute("href", "/cz/testovaci-procedura")
    await expect(first.getByRole("link", { name: /Více o testovací proceduře/ })).toHaveAttribute("href", "/cz/testovaci-procedura")
  })

  test("a procedure shows its content beside the booking box and its prices", async ({ page }) => {
    await page.goto("/cz/testovaci-procedura")
    await expect(page).toHaveTitle("Testovací procedura")
    await expect(page.getByRole("heading", { level: 1, name: "Testovací procedura" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Východní medicína" }).first()).toHaveAttribute("href", "/cz/vychodni-medicina")
    await expect(page.getByTestId("procedure-perex")).toHaveText("Perex testovací procedury.")
    await expect(page.getByTestId("procedure-sections").locator("strong")).toHaveText("procedury")
    await expect(page.getByRole("heading", { level: 3 })).toContainText(["Diagnostika", "Ošetření"])
    await expect(page.getByRole("link", { name: "Rezervovat proceduru" })).toHaveAttribute("href", "/cz/content/contact")

    // Hidden rows stay in the CMS.
    const prices = page.getByTestId("price-list")
    await expect(prices.getByRole("term")).toHaveText(["Jedno sezení", "Balíček 5 sezení"])
    await expect(prices.getByRole("definition")).toHaveText(["1.000 Kč", "4.000 Kč"])

    const related = page.getByRole("region", { name: "Související procedury" })
    await expect(related.getByTestId("procedure-card")).toHaveText([/Druhá procedura/])

    const trail = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}")
    expect(trail.itemListElement.map((i: { name: string }) => i.name)).toEqual(["Hlavní stránka", "Východní medicína", "Testovací procedura"])
  })

  test("a procedure lists its sub-procedures; a sub-procedure sits under it", async ({ page }) => {
    await page.goto("/cz/injekcni-aplikace")
    await expect(page.getByRole("link", { name: "Rezervovat konzultaci" })).toBeVisible()
    const offer = page.getByRole("region", { name: "Co vám nabízíme?" })
    await expect(offer.getByTestId("procedure-card").getByRole("heading", { level: 3 })).toHaveText(["Modelace rtů"])

    await page.goto("/cz/modelace-rtu")
    await expect(page.getByRole("link", { name: "Západní medicína" }).first()).toHaveAttribute("href", "/cz/zapadni-medicina")
    await expect(page.getByRole("link", { name: "Injekční aplikace" }).first()).toHaveAttribute("href", "/cz/injekcni-aplikace")
    await expect(page.getByRole("heading", { level: 2, name: "Neauvia® Organic" })).toBeVisible()
    await expect(page.getByText("Kyselina hyaluronová síťovaná PEG.")).toBeVisible()
    await expect(page.getByTestId("price-list").getByRole("term")).toHaveText(["Baby Lips"])
  })

  test("unknown slugs and the old /procedury addresses are 404", async ({ page }) => {
    expect((await page.goto("/cz/neexistuje"))?.status()).toBe(404)
    expect((await page.goto("/cz/procedury/vychodni-medicina"))?.status()).toBe(404)
  })
})
