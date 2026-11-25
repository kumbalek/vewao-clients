import { expect, test } from "@playwright/test"

// The legacy shop's November updates (vewao-clients#62): "Doprava a platba"
// and the seller box on the terms and the privacy policy.

test("Doprava a platba lists the delivery and payment options", async ({ page }) => {
  await page.goto("/cz/content/shipping-and-payment")

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Doprava a platba")
  const shipping = page.getByRole("region", { name: "Možnosti dopravy" })
  await expect(shipping.getByText("Osobní odběr", { exact: true })).toBeVisible()
  await expect(shipping.getByText("Kosmická 19, 149 00 Praha 4 - Háje")).toBeVisible()
  await expect(shipping.getByRole("link", { name: "PPL" })).toHaveAttribute(
    "href",
    "https://www.ppl.cz/vyhledat-zasilku"
  )
  const payment = page.getByRole("region", { name: "Možnosti platby" })
  for (const name of ["Bankovní převod", "Hotově", "Rychlé online platby", "On-line platba kartou"]) {
    await expect(payment.getByText(name, { exact: true })).toBeVisible()
  }
  await expect(payment.getByRole("link", { name: "Platební brána Comgate" }).first()).toHaveAttribute(
    "href",
    "https://www.comgate.cz/cz/platebni-brana"
  )
})

test("customer service links to Doprava a platba", async ({ page }) => {
  await page.goto("/cz/content/customer-service")

  const link = page.getByRole("main").getByRole("link", { name: "Doprava a platba" })
  await expect(link).toHaveAttribute("href", "/cz/content/shipping-and-payment")
})

// The terms name the seller in a box, the privacy information as its controller
// (texts of 2026-12-01, vewao-clients#85); both with the commercial register entry.
for (const [path, heading] of [
  ["/cz/content/terms-of-use", "Prodávající:"],
  ["/cz/content/privacy-policy", "1. Správce osobních údajů"],
]) {
  test(`${path} names the seller with the commercial register entry`, async ({ page }) => {
    await page.goto(path)

    const seller = page.getByRole("heading", { name: heading }).locator("..")
    await expect(seller).toContainText("Mgr. Judita Halvová")
    await expect(seller).toContainText("64417441")
    await expect(seller).toContainText(
      "zapsaná v obchodním rejstříku vedeném Městským soudem v Praze, sp.zn. A 60912"
    )
  })
}

test("the terms name the checkout's last button and link the withdrawal form", async ({ page }) => {
  await page.goto("/cz/content/terms-of-use")

  const terms = page.getByTestId("legal-document")
  await expect(terms).toContainText("tlačítko označené „Objednat s povinností platby“")
  await expect(
    terms.getByRole("link", { name: "https://www.by-judith.com/cz/odstoupeni-od-smlouvy" }).first()
  ).toHaveAttribute("href", "/cz/odstoupeni-od-smlouvy")
  await expect(terms).not.toContainText(/příloh\S* č\./)
})
