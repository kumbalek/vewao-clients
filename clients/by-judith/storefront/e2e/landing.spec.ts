import { expect, test, type Page } from "@playwright/test"

const SHOP = "http://127.0.0.1:8101"

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: "_medusa_cache_id", value: crypto.randomUUID(), url: SHOP, sameSite: "Lax" },
  ])
})

async function expectLandingLinks(page: Page) {
  const hero = page.getByTestId("landing-hero")
  // Mobile and desktop lines are separate; only the one for the viewport is exposed.
  await expect(hero.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "Snoubíme západ s východem"
  )
  // Every beat's link is a real anchor from the first paint, whatever the scroll.
  await expect(hero.getByRole("link", { name: "Lasery · injekční ošetření · pleť" })).toHaveAttribute(
    "href",
    "/cz/procedury/beauty"
  )
  await expect(hero.getByRole("link", { name: "TCM diagnostika · akupunktura" })).toHaveAttribute(
    "href",
    "/cz/procedury/akupunktura"
  )
  // The closing CTA uses the header's wording and target.
  await expect(hero.getByRole("link", { name: "Rezervovat" })).toHaveAttribute(
    "href",
    "/cz/content/contact"
  )
}

test("the home page is the clinic landing, its links present at load", async ({ page }) => {
  await page.goto("/cz")
  await expectLandingLinks(page)
  await expect(page.getByTestId("landing-hero")).toHaveAttribute("data-motion", "full")
})

test("the hero loads the crop for the viewport, opening run first", async ({ page, isMobile }) => {
  const crop = isMobile ? "portrait" : "wide"
  const first = page.waitForRequest(new RegExp(`/assets/landing/frames/${crop}/frame-000\\.webp$`))
  await page.goto("/cz")
  await first
  // Revealed once the opening run is in memory.
  await expect(page.getByTestId("landing-stage").locator("canvas").locator("..")).toHaveClass(
    /opacity-100/
  )
})

test("the stage pins right below the sticky header", async ({ page }) => {
  await page.goto("/cz")
  const stage = page.getByTestId("landing-stage")
  await expect(stage).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, window.innerHeight))

  // The hero repeats the header's height; this fails if the two drift apart.
  await expect
    .poll(async () => {
      const header = await page.getByRole("banner").boundingBox()
      const box = await stage.boundingBox()
      return Math.round(box!.y - (header!.y + header!.height))
    })
    .toBe(0)
  // It fills the rest of the viewport.
  const box = await stage.boundingBox()
  expect(Math.round(box!.y + box!.height)).toBe(page.viewportSize()!.height)
})

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" })

  test("the hero is a static layout with every claim and link", async ({ page }) => {
    await page.goto("/cz")
    const hero = page.getByTestId("landing-hero")
    await expect(hero).toHaveAttribute("data-motion", "reduced")
    await expect(hero.locator("canvas")).toHaveCount(0)
    const claims = hero.getByRole("heading", { level: 2 })
    await expect(claims).toHaveCount(3)
    await expect(claims.nth(0)).toHaveAccessibleName("Efektivita pro moderní život")
    await expect(claims.nth(1)).toHaveAccessibleName("Revoluce v akupunktuře")
    await expect(claims.nth(2)).toHaveAccessibleName("Dva směry, jeden cíl")
    // Each claim under the still it would rest on.
    await expect(hero.locator("img")).toHaveCount(4)
    await expect(hero.locator("img").nth(2)).toHaveAttribute(
      "src",
      "/assets/landing/frames/wide/frame-125.webp"
    )
    await expectLandingLinks(page)
  })
})

test("the header logo is the diamond and leads home", async ({ page }) => {
  await page.goto("/cz/shop")
  const logo = page.getByRole("banner").getByRole("link", { name: "JuditH – úvodní stránka" })
  await expect(logo.getByRole("img")).toHaveAttribute("src", "/logo_gold.svg")
  await logo.click()
  await expect(page).toHaveURL(/\/cz$/)
  await expect(page.getByTestId("landing-hero")).toBeVisible()
})

test("the former home page is the e-shop's front page", async ({ page, isMobile }) => {
  await page.goto("/cz")

  if (isMobile) {
    const open = page.getByRole("button", { name: "Otevřít menu" })
    await expect(open).toBeVisible()
    await page.waitForFunction(
      (element) =>
        !!element && Object.keys(element).some((key) => key.startsWith("__reactFiber")),
      await open.elementHandle()
    )
    await open.click()
    const menu = page.getByRole("dialog", { name: "Menu" })
    await menu.getByText("Shop", { exact: true }).click()
    await menu.getByRole("link", { name: "Úvod e-shopu" }).click()
    // Following a link closes the menu rather than leaving it over the new page.
    await expect(menu).toBeHidden()
  } else {
    const shop = page.getByRole("navigation", { name: "Hlavní navigace" }).getByRole("button", {
      name: "Shop",
    })
    await shop.hover()
    await page.getByRole("link", { name: "Úvod e-shopu" }).click()
  }

  await expect(page).toHaveURL(/\/cz\/shop$/)
  await expect(page).toHaveTitle("Shop")
  await expect(page.getByRole("heading", { level: 2, name: "Naše produkty" })).toBeVisible()
})
