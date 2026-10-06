import {
  expect,
  test,
  type APIRequestContext,
  type APIResponse,
  type Locator,
  type Page,
} from "@playwright/test"

type RecordedRequest = { method: string; path: string; body: unknown }

const MOCK = "http://127.0.0.1:9101"
const SHOP = "http://127.0.0.1:8101"

// Server-rendered controls ignore input until React hydrates them.
async function waitForHydration(page: Page, control: Locator) {
  await expect(control).toBeVisible()
  await page.waitForFunction(
    (element) =>
      !!element && Object.keys(element).some((key) => key.startsWith("__reactFiber")),
    await control.elementHandle()
  )
}

async function recordedRequests(request: APIRequestContext): Promise<RecordedRequest[]> {
  const response = await request.get(`${MOCK}/__requests`)
  expect(response.ok()).toBe(true)
  return (await response.json()) as RecordedRequest[]
}

function withdrawalPosts(requests: RecordedRequest[]) {
  return requests.filter((request) => request.method === "POST" && request.path === "/store/withdrawals")
}

test.beforeEach(async ({ context, request }) => {
  await request.post(`${MOCK}/__reset`)
  await context.addCookies([
    { name: "_medusa_cart_id", value: `cart_test_${crypto.randomUUID()}`, url: SHOP, sameSite: "Lax" },
    { name: "_medusa_cache_id", value: crypto.randomUUID(), url: SHOP, sameSite: "Lax" },
  ])
})

test("footer links to withdrawal page", async ({ page }) => {
  await page.goto("/cz")
  await page.getByRole("contentinfo").getByRole("link", { name: "Odstoupit od smlouvy" }).click()

  await expect(page).toHaveURL(new RegExp("/cz/odstoupeni-od-smlouvy$"))
  await expect(page.getByRole("heading", { name: "Odstoupit od smlouvy" })).toBeVisible()
})

test("empty submission shows validation errors and does not submit", async ({ page, request }) => {
  await page.goto("/cz/odstoupeni-od-smlouvy")
  const submit = page.getByRole("button", { name: "Pokračovat ke kontrole" })
  await waitForHydration(page, submit)
  await submit.click()

  await expect(page.getByText("Vyplňte číslo objednávky.")).toBeVisible()
  await expect(page.getByText("Vyplňte jméno a příjmení.")).toBeVisible()
  await expect(page.getByText("Vyplňte platný e-mail.")).toBeVisible()
  const order = page.getByLabel("Číslo objednávky")
  await expect(order).toHaveAttribute("aria-invalid", "true")
  await expect(page.getByLabel("Jméno a příjmení")).toHaveAttribute("aria-invalid", "true")
  await expect(page.getByLabel("E-mail")).toHaveAttribute("aria-invalid", "true")
  await expect(order).toBeFocused()
  await expect(page.getByTestId("withdrawal-form")).toBeVisible()

  expect(withdrawalPosts(await recordedRequests(request))).toHaveLength(0)
})

test("successful withdrawal reviews, submits once and confirms", async ({ page, request }) => {
  await page.goto("/cz/odstoupeni-od-smlouvy")
  const submit = page.getByRole("button", { name: "Pokračovat ke kontrole" })
  await waitForHydration(page, submit)
  await page.getByLabel("Číslo objednávky").fill("1042")
  await page.getByLabel("Jméno a příjmení").fill("Jana Nováková")
  await page.getByLabel("E-mail").fill("jana@example.cz")
  await page.getByLabel("Zboží, kterého se odstoupení týká (nepovinné)").fill("1× Antistress")
  await submit.click()

  const reviewHeading = page.getByRole("heading", { name: "Zkontrolujte a potvrďte odstoupení" })
  await expect(reviewHeading).toBeVisible()
  await expect(reviewHeading).toBeFocused()
  await expect(page.getByText("1042", { exact: true })).toBeVisible()
  await expect(page.getByText("1× Antistress")).toBeVisible()
  await expect(page.getByText("Jana Nováková")).toBeVisible()
  await expect(page.getByText("jana@example.cz")).toBeVisible()

  await page.getByRole("button", { name: "Potvrdit odstoupení od smlouvy" }).click()
  const doneHeading = page.getByRole("heading", { name: "Odstoupení od smlouvy jsme přijali" })
  await expect(doneHeading).toBeVisible()
  await expect(doneHeading).toBeFocused()
  await expect(page.getByText("6. října 2026")).toBeVisible()
  await expect(page.getByText("14:34:56")).toBeVisible()
  await expect(page.getByTestId("withdrawal-done").getByText("jana@example.cz").first()).toBeVisible()
  await expect(page.getByTestId("withdrawal-done").getByText("Číslo objednávky: 1042")).toBeVisible()

  const posts = withdrawalPosts(await recordedRequests(request))
  expect(posts).toHaveLength(1)
  expect(posts[0].body).toEqual({
    order_reference: "1042",
    customer_name: "Jana Nováková",
    email: "jana@example.cz",
    items: "1× Antistress",
    confirmed: true,
  })
})

test("empty goods are reviewed and submitted as the whole order", async ({ page, request }) => {
  await page.goto("/cz/odstoupeni-od-smlouvy")
  const submit = page.getByRole("button", { name: "Pokračovat ke kontrole" })
  await waitForHydration(page, submit)
  await page.getByLabel("Číslo objednávky").fill("1042")
  await page.getByLabel("Jméno a příjmení").fill("Jana Nováková")
  await page.getByLabel("E-mail").fill("jana@example.cz")
  await submit.click()

  await expect(page.getByTestId("withdrawal-review").getByText("celá objednávka")).toBeVisible()
  await page.getByRole("button", { name: "Potvrdit odstoupení od smlouvy" }).click()
  await expect(page.getByTestId("withdrawal-done")).toBeVisible()

  const posts = withdrawalPosts(await recordedRequests(request))
  expect(posts).toHaveLength(1)
  expect(posts[0].body).toMatchObject({ items: null })
})

test("review edit returns to the form with values and no submission", async ({ page, request }) => {
  await page.goto("/cz/odstoupeni-od-smlouvy")
  const submit = page.getByRole("button", { name: "Pokračovat ke kontrole" })
  await waitForHydration(page, submit)
  await page.getByLabel("Číslo objednávky").fill("1042")
  await page.getByLabel("Jméno a příjmení").fill("Jana Nováková")
  await page.getByLabel("E-mail").fill("jana@example.cz")
  await page.getByLabel("Zboží, kterého se odstoupení týká (nepovinné)").fill("1× Antistress")
  await submit.click()

  await expect(page.getByTestId("withdrawal-review")).toBeVisible()
  await page.getByRole("button", { name: "Upravit údaje" }).click()
  await expect(page.getByTestId("withdrawal-form")).toBeVisible()
  await expect(page.getByLabel("Číslo objednávky")).toHaveValue("1042")
  await expect(page.getByLabel("Jméno a příjmení")).toHaveValue("Jana Nováková")
  await expect(page.getByLabel("E-mail")).toHaveValue("jana@example.cz")
  await expect(page.getByLabel("Zboží, kterého se odstoupení týká (nepovinné)")).toHaveValue(
    "1× Antistress"
  )

  expect(withdrawalPosts(await recordedRequests(request))).toHaveLength(0)
})

test("order query parameter prefills order number", async ({ page }) => {
  await page.goto("/cz/odstoupeni-od-smlouvy?objednavka=1042")

  await expect(page.getByLabel("Číslo objednávky")).toHaveValue("1042")
})

test("backend failure shows alert on review", async ({ page }) => {
  await page.goto("/cz/odstoupeni-od-smlouvy")
  const submit = page.getByRole("button", { name: "Pokračovat ke kontrole" })
  await waitForHydration(page, submit)
  await page.getByLabel("Číslo objednávky").fill("500")
  await page.getByLabel("Jméno a příjmení").fill("Jana Nováková")
  await page.getByLabel("E-mail").fill("jana@example.cz")
  await submit.click()

  await expect(page.getByTestId("withdrawal-review")).toBeVisible()
  await page.getByRole("button", { name: "Potvrdit odstoupení od smlouvy" }).click()

  await expect(page.getByTestId("withdrawal-review").getByRole("alert")).toContainText(
    "Odeslání se nezdařilo"
  )
  await expect(page.getByRole("heading", { name: "Zkontrolujte a potvrďte odstoupení" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Potvrdit odstoupení od smlouvy" })).toBeVisible()
})

test("withdrawal can be completed with keyboard only", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard-only desktop test")

  await page.goto("/cz/odstoupeni-od-smlouvy")
  const submit = page.getByRole("button", { name: "Pokračovat ke kontrole" })
  await waitForHydration(page, submit)
  await page.getByLabel("Číslo objednávky").focus()
  await page.keyboard.type("1042")
  await page.keyboard.press("Tab")
  await page.keyboard.type("Jana Nováková")
  await page.keyboard.press("Tab")
  await page.keyboard.type("jana@example.cz")
  await page.keyboard.press("Tab")
  await page.keyboard.type("1× Antistress")
  await page.keyboard.press("Tab")
  await page.keyboard.press("Enter")

  const confirm = page.getByRole("button", { name: "Potvrdit odstoupení od smlouvy" })
  await expect(confirm).toBeVisible()
  await page.keyboard.press("Tab")
  await expect(confirm).toBeFocused()
  await page.keyboard.press("Enter")

  await expect(page.getByTestId("withdrawal-done")).toBeVisible()
})
