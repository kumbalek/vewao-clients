import { expect, test } from "@playwright/test"

test.beforeEach(async ({ context, request }) => {
  await request.post("http://127.0.0.1:9101/__reset")
  await context.addCookies([
    {
      name: "_medusa_cart_id",
      value: `cart_test_${crypto.randomUUID()}`,
      url: "http://127.0.0.1:8101",
    },
    {
      name: "_medusa_cache_id",
      value: crypto.randomUUID(),
      url: "http://127.0.0.1:8101",
    },
  ])
})

test("keeps the Czech homepage and its original branding", async ({
  page,
}, testInfo) => {
  await page.goto("/cz")
  await expect(page.locator("html")).toHaveAttribute("lang", "cs")
  await expect(page.locator('img[src*="logo.webp"]').first()).toBeVisible()
  await expect(page.locator("main")).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath("homepage.png"),
    fullPage: true,
  })
})

test("keeps non-production hosts out of search results", async ({ page }) => {
  const home = await page.request.get("/cz")
  expect(home.ok()).toBe(true)
  expect(home.headers()["x-robots-tag"]).toBe("noindex, nofollow")

  const robots = await page.request.get("/robots.txt")
  expect(robots.headers()["content-type"]).toContain("text/plain")
  expect(await robots.text()).toContain("Allow: /")
})

test("offers Comgate without loading obsolete payment scripts", async ({
  page,
  request,
}) => {
  const obsoleteRequests: string[] = []
  page.on("request", (req) => {
    if (/stripe\.com|stripe\.network/.test(req.url()))
      obsoleteRequests.push(req.url())
  })
  await page.goto("/cz/checkout?step=payment")
  await expect(page.getByTestId("checkout-container")).toBeVisible()
  await expect(page.getByRole("radio", { name: /Comgate/ })).toBeVisible()
  await expect(page.getByRole("radio")).toHaveCount(1)
  await expect(page.getByTestId("submit-payment-button")).toBeDisabled()
  await page.getByRole("radio", { name: /Comgate/ }).focus()
  await page.getByRole("radio", { name: /Comgate/ }).press("Space")
  await expect(page.getByRole("radio", { name: /Comgate/ })).toBeChecked()
  await page.getByTestId("submit-payment-button").click()
  await expect(page).toHaveURL(/step=review/)
  await expect(page.getByTestId("submit-order-button")).toBeDisabled()
  await page.locator("#accept-agreement").focus()
  await page.locator("#accept-agreement").press("Space")
  await expect(page.getByTestId("submit-order-button")).toBeEnabled()
  const requests = await (
    await request.get("http://127.0.0.1:9101/__requests")
  ).json()
  expect(requests).toContainEqual(
    expect.objectContaining({
      method: "POST",
      body: expect.objectContaining({ provider_id: "pp_comgate_comgate" }),
    })
  )
  expect(
    requests.some((req: { path: string }) => req.path.endsWith("/complete"))
  ).toBe(false)
  expect(obsoleteRequests).toEqual([])
})

test("preserves the existing manual payment option for zero-price pickup", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "_medusa_cart_id",
      value: `cart_pickup_${crypto.randomUUID()}`,
      url: "http://127.0.0.1:8101",
    },
  ])
  await page.goto("/cz/checkout?step=payment")
  await expect(page.getByRole("radio", { name: /Comgate/ })).toBeVisible()
  await expect(page.getByRole("radio", { name: /Osobní platba/ })).toBeVisible()
  await expect(page.getByRole("radio")).toHaveCount(2)
})
