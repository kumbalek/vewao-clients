import {
  expect,
  test,
  type APIRequestContext,
  type BrowserContext,
  type Page,
} from "@playwright/test"

const MOCK = "http://127.0.0.1:9101"
const SHOP = "http://127.0.0.1:8101"

// Same attributes the storefront sets, so gateway returns behave as in production.
function cartCookie(value: string) {
  return { name: "_medusa_cart_id", value, url: SHOP, sameSite: "Lax" as const }
}

test.beforeEach(async ({ context, request }) => {
  await request.post(`${MOCK}/__reset`)
  await context.addCookies([
    cartCookie(`cart_test_${crypto.randomUUID()}`),
    {
      name: "_medusa_cache_id",
      value: crypto.randomUUID(),
      url: SHOP,
      sameSite: "Lax",
    },
  ])
})

async function mockRequests(request: APIRequestContext) {
  return (await (await request.get(`${MOCK}/__requests`)).json()) as {
    method: string
    path: string
  }[]
}

async function cartCookieValue(context: BrowserContext) {
  return (await context.cookies(SHOP)).find(
    ({ name }) => name === "_medusa_cart_id"
  )?.value
}

// Server-rendered radios ignore clicks until React hydrates them, which after a
// redirect can finish later than the URL assertion.
async function waitForPaymentHydration(page: Page) {
  await page.waitForFunction(() => {
    const radio = document.querySelector('[role="radio"]')
    return (
      !!radio && Object.keys(radio).some((key) => key.startsWith("__reactFiber"))
    )
  })
}

async function payWithComgate(page: Page) {
  await page.goto("/cz/checkout?step=payment")
  await waitForPaymentHydration(page)
  await page.getByRole("radio", { name: /Comgate/ }).click()
  await page.getByTestId("submit-payment-button").click()
  await expect(page).toHaveURL(/step=review/)
  await page.locator("#accept-agreement").click()
  await page.getByTestId("submit-order-button").click()
  await expect(page).toHaveURL(/^http:\/\/localhost:9101\/__comgate\/pay/)
  await page.getByRole("link", { name: "Zpět do obchodu" }).click()
}

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
  await waitForPaymentHydration(page)
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

test("offers pay-on-site only with clinic pickup, never for free delivery", async ({
  page,
  context,
}) => {
  await context.addCookies([cartCookie(`cart_pickup_${crypto.randomUUID()}`)])
  await page.goto("/cz/checkout?step=payment")
  await expect(page.getByRole("radio", { name: /Comgate/ })).toBeVisible()
  await expect(page.getByRole("radio", { name: /Osobní platba/ })).toBeVisible()
  await expect(page.getByRole("radio")).toHaveCount(2)

  await context.addCookies([cartCookie(`cart_freeppl_${crypto.randomUUID()}`)])
  await page.goto("/cz/checkout?step=payment")
  await expect(page.getByRole("radio", { name: /Comgate/ })).toBeVisible()
  await expect(page.getByRole("radio")).toHaveCount(1)
})

test("creates a Comgate order only after the gateway returns paid", async ({
  page,
  context,
  request,
}) => {
  await payWithComgate(page)

  await expect(page).toHaveURL(/\/cz\/order\/order_cart_test_.+\/confirmed$/)
  await expect(page.getByTestId("order-complete-container")).toContainText(
    "Děkujeme"
  )
  const paths = (await mockRequests(request)).map(({ path }) => path)
  const gateway = paths.indexOf("/__comgate/pay")
  const completions = paths.filter((path) => path.endsWith("/complete"))
  expect(gateway).toBeGreaterThan(-1)
  expect(completions).toHaveLength(1)
  expect(paths.findIndex((path) => path.endsWith("/complete"))).toBeGreaterThan(
    gateway
  )
  expect(await cartCookieValue(context)).toBeFalsy()
})

test("returns a cancelled Comgate payment to the payment step with the cart kept", async ({
  page,
  context,
  request,
}) => {
  await request.post(`${MOCK}/__comgate/outcome`, {
    data: { status: "CANCELLED" },
  })
  const cartId = await cartCookieValue(context)

  await payWithComgate(page)

  await expect(page).toHaveURL(/\/cz\/checkout\?step=payment&payment=failed$/)
  await expect(page.getByTestId("payment-failed-message")).toBeVisible()
  expect(await cartCookieValue(context)).toBe(cartId)

  // Retrying creates a fresh gateway session and clears the failure notice.
  await waitForPaymentHydration(page)
  await page.getByRole("radio", { name: /Comgate/ }).click()
  await page.getByTestId("submit-payment-button").click()
  await expect(page).toHaveURL(/step=review/)
  await expect(page).not.toHaveURL(/payment=failed/)
})

test("explains a gateway setup failure in Czech and stays on payment", async ({
  page,
  context,
}) => {
  await context.addCookies([cartCookie(`cart_gatewaydown_${crypto.randomUUID()}`)])
  await page.goto("/cz/checkout?step=payment")
  await waitForPaymentHydration(page)
  await page.getByRole("radio", { name: /Comgate/ }).click()
  await page.getByTestId("submit-payment-button").click()

  await expect(page.getByTestId("payment-method-error-message")).toHaveText(
    /Platbu se nepodařilo připravit/
  )
  await expect(page).toHaveURL(/step=payment/)
})

test("shows a pending Comgate payment without claiming success", async ({
  page,
  request,
}) => {
  await request.post(`${MOCK}/__comgate/outcome`, {
    data: { status: "PENDING" },
  })

  await payWithComgate(page)

  await expect(page).toHaveURL(/\/cz\/order\/pending$/)
  await expect(page.getByTestId("order-pending-container")).not.toContainText(
    "Děkujeme"
  )

  await request.post(`${MOCK}/__comgate/outcome`, { data: { status: "PAID" } })
  await page.getByTestId("check-payment-link").click()
  await expect(page).toHaveURL(/\/cz\/order\/order_cart_test_.+\/confirmed$/)
})

test("places a pay-on-site pickup order directly, but never from the gateway return link", async ({
  page,
  context,
  request,
}) => {
  await context.addCookies([cartCookie(`cart_pickup_${crypto.randomUUID()}`)])
  await page.goto("/cz/checkout?step=payment")
  await waitForPaymentHydration(page)
  await page.getByRole("radio", { name: /Osobní platba/ }).click()
  await page.getByTestId("submit-payment-button").click()
  await expect(page).toHaveURL(/step=review/)

  // A crafted link to the return route must not complete a pay-on-site cart.
  await page.goto("/cz/checkout/payment-return")
  await expect(page).toHaveURL(/step=payment&payment=failed$/)
  expect(
    (await mockRequests(request)).some(({ path }) => path.endsWith("/complete"))
  ).toBe(false)

  await page.goto("/cz/checkout?step=review")
  await page.locator("#accept-agreement").click()
  await page.getByTestId("submit-order-button").click()
  await expect(page).toHaveURL(/\/cz\/order\/order_cart_pickup_.+\/confirmed$/)
})
