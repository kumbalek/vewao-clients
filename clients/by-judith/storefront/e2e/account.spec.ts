import { expect as baseExpect, test, type Locator, type Page } from "@playwright/test"

const MOCK = "http://127.0.0.1:9101"
const SHOP = "http://127.0.0.1:8101"

// Server actions (sign-in, register, reset) and first-visit compilation are
// slow under `next dev` on CI runners.
const expect = baseExpect.configure({ timeout: 15_000 })
test.use({ reducedMotion: "reduce" })

const JANA = { email: "jana@example.cz", password: "heslo1234" }

// Server-rendered controls ignore input until React hydrates them.
async function waitForHydration(page: Page, control: Locator) {
  await expect(control).toBeVisible()
  await page.waitForFunction(
    (element) =>
      !!element && Object.keys(element).some((key) => key.startsWith("__reactFiber")),
    await control.elementHandle()
  )
}

async function signIn(page: Page, email = JANA.email, password = JANA.password) {
  await page.goto("/cz/account")
  const submit = page.getByTestId("sign-in-button")
  await waitForHydration(page, submit)
  await page.getByLabel("E-mail").fill(email)
  await page.getByLabel("Heslo").fill(password)
  await submit.click()
}

test.beforeEach(async ({ context, request }) => {
  await request.post(`${MOCK}/__reset`)
  await request.post(`${MOCK}/__customer/seed`)
  await context.addCookies([
    { name: "_medusa_cart_id", value: `cart_test_${crypto.randomUUID()}`, url: SHOP, sameSite: "Lax" },
    { name: "_medusa_cache_id", value: crypto.randomUUID(), url: SHOP, sameSite: "Lax" },
  ])
})

test("header account link opens the sign-in form", async ({ page }) => {
  await page.goto("/cz/store")
  await page.getByRole("link", { name: "Můj účet" }).first().click()

  await expect(page).toHaveURL(/\/cz\/account$/)
  await expect(page.getByRole("heading", { level: 1, name: "Vítejte zpět" })).toBeVisible()
})

test("a wrong password is rejected in Czech", async ({ page }) => {
  await signIn(page, JANA.email, "spatne-heslo")

  await expect(page.getByTestId("login-error-message")).toHaveText("E-mail nebo heslo nesouhlasí.")
})

test("a customer signs in, sees their order and starts a prefilled return", async ({ page }) => {
  await signIn(page)

  await expect(page.getByRole("heading", { level: 1, name: "Dobrý den, Jana" })).toBeVisible()
  await expect(page.getByText("Přihlášeni jako jana@example.cz")).toBeVisible()
  const card = page.getByTestId("order-card")
  await expect(card).toContainText("Objednávka č. 1002")
  await expect(card).toContainText("2 kusy")

  await card.click()
  await expect(page.getByRole("heading", { level: 1, name: "Objednávka č. 1002" })).toBeVisible()
  await expect(page.getByTestId("order-status")).toHaveText("Připravena")
  await expect(page.getByTestId("order-payment-status")).toHaveText("Zaplaceno")
  await expect(page.getByTestId("order-return")).toContainText("Vrácení zboží")

  await page.getByTestId("order-return-button").click()
  await expect(page).toHaveURL(/\/cz\/odstoupeni-od-smlouvy\?objednavka=1002$/)
  await expect(page.getByLabel("Číslo objednávky")).toHaveValue("1002")
  await expect(page.getByLabel("Jméno a příjmení")).toHaveValue("Jana Nováková")
  await expect(page.getByLabel("E-mail")).toHaveValue("jana@example.cz")
  await expect(page.getByLabel(/Zboží, kterého se odstoupení týká/)).toHaveValue("2× Akční produkt")
})

test("another customer's order is not shown in the account", async ({ page, request }) => {
  // An order placed as a guest exists, but does not belong to Jana.
  const cartId = `cart_test_${crypto.randomUUID()}`
  await request.post(`${MOCK}/__cart/seed`, { data: { cartId, quantity: 1 } })
  await signIn(page)
  await expect(page.getByRole("heading", { level: 1, name: "Dobrý den, Jana" })).toBeVisible()

  // The account's loading boundary streams, so the status stays 200; the order is withheld.
  await page.goto(`/cz/account/orders/details/order_${cartId}`)
  await expect(page.getByText("Stránka kterou hledáte nebyla nalezena.")).toBeVisible()
  await expect(page.getByTestId("order-details-container")).toHaveCount(0)
})

test("a new customer registers and lands in the account", async ({ page }) => {
  await page.goto("/cz/account")
  const toRegister = page.getByTestId("register-button")
  await waitForHydration(page, toRegister)
  await toRegister.click()

  await page.getByLabel("Jméno").first().fill("Petra")
  await page.getByLabel("Příjmení").fill("Svobodová")
  await page.getByLabel("E-mail").fill("petra@example.cz")
  await page.getByLabel("Heslo").fill("tajne-heslo")
  await page.getByRole("button", { name: "Zaregistrujte se" }).click()

  await expect(page.getByRole("heading", { level: 1, name: "Dobrý den, Petra" })).toBeVisible()
  await expect(page.getByTestId("no-orders-container")).toContainText("Zatím u nás nemáte žádnou objednávku.")
})

test("registering an existing e-mail explains what to do", async ({ page }) => {
  await page.goto("/cz/account")
  const toRegister = page.getByTestId("register-button")
  await waitForHydration(page, toRegister)
  await toRegister.click()

  await page.getByLabel("Jméno").first().fill("Jana")
  await page.getByLabel("Příjmení").fill("Nováková")
  await page.getByLabel("E-mail").fill(JANA.email)
  await page.getByLabel("Heslo").fill("jine-heslo")
  await page.getByRole("button", { name: "Zaregistrujte se" }).click()

  await expect(page.getByTestId("register-error")).toContainText("Pokud už u nás účet máte")
})

test("a forgotten password is reset with the single-use e-mailed link", async ({ page, request }) => {
  await page.goto("/cz/account")
  const forgot = page.getByTestId("forgot-password-button")
  await waitForHydration(page, forgot)
  await forgot.click()
  await page.getByLabel("E-mail").fill(JANA.email)
  await page.getByTestId("reset-request-button").click()
  await expect(page.getByTestId("reset-request-sent")).toContainText("poslali jsme vám odkaz")

  const { token } = (await (await request.get(`${MOCK}/__password-reset`)).json()) as { token: string }
  expect(token).toBeTruthy()

  const link = `/cz/account/reset-password?token=${encodeURIComponent(token)}`
  await page.goto(link)
  const save = page.getByTestId("reset-password-button")
  await waitForHydration(page, save)
  await page.getByLabel("Nové heslo").fill("nove-heslo-123")
  await save.click()
  await expect(page.getByTestId("reset-password-done")).toHaveText("Heslo jsme změnili. Nyní se můžete přihlásit.")

  // The token is spent.
  await page.goto(link)
  await waitForHydration(page, page.getByTestId("reset-password-button"))
  await page.getByLabel("Nové heslo").fill("jeste-jine-heslo")
  await page.getByTestId("reset-password-button").click()
  await expect(page.getByTestId("reset-password-error")).toHaveText("Odkaz už neplatí. Požádejte prosím o nový.")

  await signIn(page, JANA.email, "nove-heslo-123")
  await expect(page.getByRole("heading", { level: 1, name: "Dobrý den, Jana" })).toBeVisible()
})

test("a customer updates the phone number and signs out", async ({ page }) => {
  await signIn(page)
  await page.getByRole("navigation", { name: "Můj účet" }).getByRole("link", { name: "Profil" }).click()
  await expect(page.getByRole("heading", { level: 1, name: "Profil" })).toBeVisible()
  await expect(page.getByTestId("profile-email")).toContainText(JANA.email)

  const phone = page.getByTestId("account-phone-editor")
  await phone.getByTestId("edit-button").click()
  await phone.getByLabel("Telefon").fill("777999888")
  await phone.getByTestId("save-button").click()
  await expect(phone.getByTestId("current-info")).toHaveText("777999888")

  await page.getByTestId("logout-button").click()
  await expect(page.getByRole("heading", { level: 1, name: "Vítejte zpět" })).toBeVisible()
})
