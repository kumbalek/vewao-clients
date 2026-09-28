import { expect, test, type Page } from "@playwright/test"

const HOTSPOT = "№ 1 Allergy – podrobnosti"

// The hotspot is server-rendered; it ignores input until React hydrates it.
async function waitForHotspotHydration(page: Page) {
  await page.waitForFunction((name) => {
    const button = document.querySelector(`[aria-label="${name}"]`)
    return (
      !!button && Object.keys(button).some((key) => key.startsWith("__reactFiber"))
    )
  }, HOTSPOT)
}

test.beforeEach(async ({ page }) => {
  await page.goto("/cz/design-system")
  await waitForHotspotHydration(page)
})

test("the design system page renders every section without sideways scroll", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", { level: 1, name: "Design system" })
  ).toBeVisible()
  for (const name of [
    "Colour",
    "Typography",
    "Buttons and links",
    "Surfaces and shape",
    "Media and hotspots",
    "Layout and motion",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible()
  }
  await expect(page).toHaveTitle(/Design system/)

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  )
  expect(overflows).toBe(false)
})

test("a loading button is disabled and announced as busy", async ({ page }) => {
  const loading = page.getByRole("button", { name: "Přidávám" }).first()
  await expect(loading).toBeDisabled()
  await expect(loading).toHaveAttribute("aria-busy", "true")
})

test("the hotspot opens and closes from the keyboard", async ({ page }) => {
  const hotspot = page.getByRole("button", { name: HOTSPOT })
  const productLink = page.getByRole("link", { name: "Zobrazit", exact: true })

  await expect(hotspot).toHaveAttribute("aria-expanded", "false")
  await expect(productLink).toBeHidden()

  await hotspot.focus()
  await page.keyboard.press("Enter")
  await expect(hotspot).toHaveAttribute("aria-expanded", "true")
  await expect(productLink).toBeVisible()

  await page.keyboard.press("Tab")
  await expect(productLink).toBeFocused()

  await page.keyboard.press("Escape")
  await expect(hotspot).toHaveAttribute("aria-expanded", "false")
  await expect(hotspot).toBeFocused()
  await expect(productLink).toBeHidden()
})

test("the hotspot opens on hover or tap and closes outside", async ({
  page,
  isMobile,
}) => {
  const hotspot = page.getByRole("button", { name: HOTSPOT })
  const productLink = page.getByRole("link", { name: "Zobrazit", exact: true })

  if (isMobile) {
    await hotspot.tap()
  } else {
    await hotspot.hover()
    await expect(hotspot).toHaveAttribute("aria-expanded", "true")
    // A click after hover must keep the card open rather than toggle it shut.
    await hotspot.click()
  }
  await expect(hotspot).toHaveAttribute("aria-expanded", "true")
  await expect(productLink).toBeVisible()
  await expect(productLink).toHaveAttribute("href", "/cz/products/allergy")

  const heading = page.getByRole("heading", { level: 1 })
  if (isMobile) await heading.tap()
  else await heading.click()
  await expect(hotspot).toHaveAttribute("aria-expanded", "false")
})
