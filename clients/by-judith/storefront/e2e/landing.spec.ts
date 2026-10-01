import { expect, test, type Locator, type Page } from "@playwright/test"

const SHOP = "http://127.0.0.1:8101"

const TRANSPARENT = "rgba(0, 0, 0, 0)"
const WHITE = "rgb(255, 255, 255)"
const INK = "rgb(24, 24, 27)"

const background = (locator: Locator) =>
  locator.evaluate((element) => getComputedStyle(element).backgroundColor)
const color = (locator: Locator) => locator.evaluate((element) => getComputedStyle(element).color)

// Server-rendered controls ignore input until React hydrates them.
async function waitForHydration(page: Page, control: Locator) {
  await expect(control).toBeVisible()
  await page.waitForFunction(
    (element) =>
      !!element && Object.keys(element).some((key) => key.startsWith("__reactFiber")),
    await control.elementHandle()
  )
}

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
  const first = page.waitForRequest(new RegExp(`/assets/landing/frames/movie/${crop}/frame-000\\.webp$`))
  await page.goto("/cz")
  await first
  // Revealed once the opening run (41 large frames) is decoded; CI runners are slow.
  await expect(page.getByTestId("landing-stage").locator("canvas").locator("..")).toHaveClass(
    /opacity-100/,
    { timeout: 20_000 }
  )
})

test("the header floats over the hero, then turns white past it", async ({ page, isMobile }) => {
  await page.goto("/cz")
  const header = page.getByRole("banner")

  // The hero starts at the top of the page, under the header. It repeats the
  // header's height; this fails if the two drift apart.
  expect(Math.round((await page.getByTestId("landing-hero").boundingBox())!.y)).toBe(0)
  expect(Math.round((await page.getByTestId("landing-stage").boundingBox())!.height)).toBe(
    page.viewportSize()!.height
  )

  // Transparent, with light text and a white booking button.
  const text = isMobile
    ? header.getByRole("button", { name: "Otevřít menu" })
    : header.getByRole("link", { name: "Kontakt" })
  const book = isMobile
    ? page.getByRole("link", { name: "Rezervovat" }).first()
    : header.getByRole("link", { name: "Rezervovat" })
  await expect.poll(() => background(header)).toBe(TRANSPARENT)
  await expect.poll(() => color(text)).toBe(WHITE)
  await expect.poll(() => background(book)).toBe(WHITE)
  if (!isMobile) {
    await expect.poll(() => background(header.getByTestId("free-delivery-note").locator(".."))).toBe(
      TRANSPARENT
    )
    await expect.poll(() => color(header.getByTestId("free-delivery-note"))).toBe(
      "rgba(255, 255, 255, 0.85)"
    )
  }

  // On desktop the footer alone is too short to scroll the hero out from under
  // the header; stand in for the sections that will follow it.
  await page.evaluate(() =>
    document.querySelector("main")!.insertAdjacentHTML("beforeend", '<div style="height:150vh"></div>')
  )
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect.poll(() => background(header)).toBe(WHITE)
  await expect.poll(() => color(text)).toBe(INK)
})

test("an open menu stays dark and see-through over the hero", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop menus")
  await page.goto("/cz")
  const header = page.getByRole("banner")
  const procedures = header.getByRole("button", { name: "Procedury" })
  await waitForHydration(page, procedures)

  await procedures.hover()
  await expect(procedures).toHaveAttribute("aria-expanded", "true")
  const panel = page.locator(`[id="${await procedures.getAttribute("aria-controls")}"]`)
  await expect(panel).toBeVisible()
  await expect.poll(() => background(header)).toBe(TRANSPARENT)
  await expect.poll(() => background(panel)).toBe("rgba(0, 0, 0, 0.5)")
  const procedure = panel.getByRole("link", { name: "Testovací procedura" })
  await expect.poll(() => color(procedure)).toBe(WHITE)
  await expect.poll(() => background(procedure)).toBe(TRANSPARENT)
  await expect.poll(() => color(header.getByRole("link", { name: "Kontakt" }))).toBe(WHITE)
})

test("pages without a dark hero keep the white header", async ({ page }) => {
  await page.goto("/cz/shop")
  await expect.poll(() => background(page.getByRole("banner"))).toBe(WHITE)
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
      "/assets/landing/frames/movie/wide/frame-125.webp"
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
    await waitForHydration(page, open)
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
    await waitForHydration(page, shop)
    await shop.hover()
    await page.getByRole("link", { name: "Úvod e-shopu" }).click()
  }

  await expect(page).toHaveURL(/\/cz\/shop$/)
  await expect(page).toHaveTitle("Shop")
  await expect(page.getByRole("heading", { level: 2, name: "Naše produkty" })).toBeVisible()
})
