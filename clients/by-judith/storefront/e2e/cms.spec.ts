import { expect as baseExpect, test } from "@playwright/test"

const SHOP = "http://127.0.0.1:8101"
const ADMIN_EMAIL = "e2e-admin@example.invalid"
const ADMIN_PASSWORD = "e2e-admin-password-1"

const expect = baseExpect.configure({ timeout: 15_000 })

// Payload needs a real migrated database; nothing here runs against the mock.
test.skip(
  !process.env.E2E_PAYLOAD_DATABASE_URL,
  "Needs a migrated Payload database (E2E_PAYLOAD_DATABASE_URL)"
)

// The tests build on each other: draft, publish, draft over the published
// page, then share-link checks against the newer draft.
test.describe.configure({ mode: "serial" })
test.use({ reducedMotion: "reduce" })

const hero = (heading: string) => ({ blockType: "hero", heading })
const layout = (heading: string) => [
  hero(heading),
  { blockType: "newsList", heading: "Novinky", limit: 3 },
]

test.describe("cms publishing", () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, "CMS flow runs once")
  })

  let token = ""
  let pageId = ""
  const slug = `e2e-${Date.now()}`

  const auth = () => ({ authorization: `JWT ${token}` })

  test.beforeAll(async ({ request }) => {
    const init = await request.get(`${SHOP}/api/users/init`)
    const { initialized } = await init.json()
    if (!initialized) {
      await request.post(`${SHOP}/api/users/first-register`, {
        data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, roles: ["admin"] },
      })
    }
    const login = await request.post(`${SHOP}/api/users/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    })
    // A database that already has other users needs its own e2e admin.
    expect(login.ok(), "Use a fresh, migrated database for E2E_PAYLOAD_DATABASE_URL").toBe(true)
    token = (await login.json()).token
  })

  test("a draft page is not public", async ({ page, request }) => {
    const res = await request.post(`${SHOP}/api/pages?draft=true`, {
      headers: auth(),
      data: { title: "E2E koncept", slug, layout: layout("Koncept 1") },
    })
    expect(res.status()).toBe(201)
    pageId = (await res.json()).doc.id

    await page.goto(`/cz/cms/${slug}`)
    await expect(
      page.getByText("Stránka kterou hledáte nebyla nalezena.")
    ).toBeVisible()
    await expect(page.getByText("Koncept 1")).toHaveCount(0)
  })

  test("publishing makes the page public", async ({ page, request }) => {
    await request.patch(`${SHOP}/api/pages/${pageId}`, {
      headers: auth(),
      data: { _status: "published" },
    })

    await page.goto(`/cz/cms/${slug}`)
    await expect(page.getByRole("heading", { name: "Koncept 1" })).toBeVisible()
    await expect(page.getByTestId("cms-preview-bar")).toHaveCount(0)
    await expect(page.getByTestId("cms-edit-link")).toHaveCount(0)
  })

  test("published news appears without waiting", async ({ page, request }) => {
    await request.post(`${SHOP}/api/news`, {
      headers: auth(),
      data: {
        title: `E2E novinka ${slug}`,
        perex: "Novinka z e2e běhu.",
        _status: "published",
      },
    })

    await page.goto(`/cz/cms/${slug}`)
    await expect(page.getByText(`E2E novinka ${slug}`)).toBeVisible()
  })

  test("a newer draft stays private", async ({ page, request }) => {
    await request.patch(`${SHOP}/api/pages/${pageId}?draft=true`, {
      headers: auth(),
      data: { layout: layout("Koncept 2") },
    })

    await page.goto(`/cz/cms/${slug}`)
    await expect(page.getByRole("heading", { name: "Koncept 1" })).toBeVisible()
    await expect(page.getByText("Koncept 2")).toHaveCount(0)
  })

  test("the share link shows the draft read-only", async ({
    browser,
    request,
  }) => {
    const res = await request.get(`${SHOP}/api/pages/${pageId}?draft=true`, {
      headers: auth(),
    })
    const { shareLink } = await res.json()

    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(shareLink)
    await expect(page).toHaveURL(new RegExp(`/cz/cms/${slug}`))
    await expect(page.getByText("Koncept 2")).toBeVisible()
    await expect(page.getByTestId("cms-preview-bar")).toContainText(
      "Náhled konceptu"
    )
    await expect(page.getByTestId("cms-edit-link")).toHaveCount(0)
    await context.close()
  })

  test("a tampered share link is rejected", async ({ request }) => {
    const res = await request.get(`${SHOP}/api/pages/${pageId}?draft=true`, {
      headers: auth(),
    })
    const { shareLink } = await res.json()

    const response = await request.get(
      shareLink.replace("mode=view", "mode=edit"),
      { maxRedirects: 0 }
    )
    expect(response.status()).toBe(401)
  })

  test("publishing the draft updates visitors", async ({
    browser,
    request,
  }) => {
    await request.patch(`${SHOP}/api/pages/${pageId}`, {
      headers: auth(),
      data: { _status: "published" },
    })

    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(`/cz/cms/${slug}`)
    await expect(page.getByRole("heading", { name: "Koncept 2" })).toBeVisible()
    await context.close()
  })
})