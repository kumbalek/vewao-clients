import { expect as baseExpect, test, type APIRequestContext } from "@playwright/test"

import { NEEDS_PAYLOAD, SHOP, ensureImage, hasPayload, lexical, payloadAuth, type Auth } from "./support/payload"

const expect = baseExpect.configure({ timeout: 15_000 })
const { doc, p, text } = lexical

// Product texts in Payload (vewao-clients#50), with Medusa's sync calls made directly.
test.skip(!hasPayload, NEEDS_PAYLOAD)
test.describe.configure({ mode: "serial" })
test.use({ reducedMotion: "reduce" })

const PRODUCT_PAGE = "/cz/products/akcni-produkt"
// The mock backend's sale product, as Medusa's sync sends it.
const saleProduct = {
  id: "prod_sale",
  handle: "akcni-produkt",
  title: "Akční produkt",
  subtitle: "Testovací akce",
  description: "Popis produktu",
  metadata: { ingredients: JSON.stringify(["Meruňka obecná (extrakt ze semene) 960 mg", "**Hořčice** setá (extrakt ze semene) 640 mg"]) },
}

const MEDUSA_EMAIL = "e2e-medusa@example.invalid"
const MEDUSA_KEY = "e2e-medusa-api-key-not-for-production"
const medusa: Auth = { authorization: `users API-Key ${MEDUSA_KEY}` }

/** The integration user Medusa's sync signs in as. */
async function ensureMedusaUser(request: APIRequestContext, admin: Auth) {
  const query = new URLSearchParams({ "where[email][equals]": MEDUSA_EMAIL })
  const [existing] = (await (await request.get(`${SHOP}/api/users?${query}`, { headers: admin })).json()).docs
  if (existing) return
  const created = await request.post(`${SHOP}/api/users`, {
    headers: admin,
    data: { email: MEDUSA_EMAIL, password: "e2e-medusa-password-1", roles: ["medusa"], enableAPIKey: true, apiKey: MEDUSA_KEY },
  })
  expect(created.status(), await created.text()).toBe(201)
}

const sync = (request: APIRequestContext, products: unknown[], headers: Auth = medusa) =>
  request.post(`${SHOP}/api/products/medusa-sync`, { headers, data: { products } })
const remove = (request: APIRequestContext, ids: string[]) =>
  request.post(`${SHOP}/api/products/medusa-delete`, { headers: medusa, data: { ids } })

test.describe("product texts from the CMS", () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, "CMS flow runs once")
  })

  let admin: Auth
  let docId = 0

  test.beforeAll(async ({ request }) => {
    admin = await payloadAuth(request)
    await ensureMedusaUser(request, admin)
    // Other specs read this product's legacy Medusa texts: start and end without a document.
    await remove(request, [saleProduct.id])
  })

  test.afterAll(async ({ request }) => {
    await remove(request, [saleProduct.id])
  })

  test("only the Medusa integration user may sync or delete", async ({ request }) => {
    expect((await sync(request, [saleProduct], admin)).status()).toBe(403)
    expect((await request.post(`${SHOP}/api/products/medusa-sync`, { data: { products: [] } })).status()).toBe(403)
    expect((await sync(request, [{ id: "prod_x" }])).status()).toBe(400)
    const deleted = await request.post(`${SHOP}/api/products/medusa-delete`, { headers: admin, data: { ids: ["prod_x"] } })
    expect(deleted.status()).toBe(403)
  })

  test("without a document the page shows Medusa's texts", async ({ page }) => {
    await page.goto(PRODUCT_PAGE)
    await expect(page.getByTestId("product-subtitle")).toHaveText("Testovací akce")
    await expect(page.getByTestId("product-description")).toHaveText("Popis produktu")
    // Only ingredients are filled in: the empty dosage and information tabs are left out.
    await expect(page.getByRole("button", { name: "Složení" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Doporučené dávkování" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Důležité informace" })).toHaveCount(0)
  })

  test("the sync creates the document once, filled from Medusa and published", async ({ page, request }) => {
    const first = await sync(request, [saleProduct])
    expect(first.status()).toBe(200)
    expect((await first.json()).created).toEqual([saleProduct.id])
    const again = await sync(request, [{ ...saleProduct, description: "Změna v Meduse" }])
    expect((await again.json()).unchanged).toEqual([saleProduct.id])

    const query = new URLSearchParams({ "where[medusaId][equals]": saleProduct.id, depth: "0" })
    const [created] = (await (await request.get(`${SHOP}/api/products?${query}`, { headers: admin })).json()).docs
    expect(created._status).toBe("published")
    docId = created.id

    await page.goto(PRODUCT_PAGE)
    await expect(page.getByTestId("product-description")).toHaveText("Popis produktu")
    await page.getByRole("button", { name: "Složení" }).click()
    const list = page.getByTestId("product-ingredients").getByRole("list")
    await expect(list.getByRole("listitem")).toHaveCount(2)
    await expect(list.locator("strong")).toHaveText(["Hořčice"])
  })

  test("published CMS texts replace Medusa's; a newer draft stays private", async ({ page, request }) => {
    const published = await request.patch(`${SHOP}/api/products/${docId}`, {
      headers: admin,
      data: { description: doc(p(text("Popis z CMS."))), dosage: doc(p(text("1 kapsle denně."))), _status: "published" },
    })
    expect(published.status(), await published.text()).toBe(200)
    await page.goto(PRODUCT_PAGE)
    await expect(page.getByTestId("product-description")).toHaveText("Popis z CMS.")
    await page.getByRole("button", { name: "Doporučené dávkování" }).click()
    await expect(page.getByTestId("product-dosage")).toHaveText("1 kapsle denně.")

    const draft = await request.patch(`${SHOP}/api/products/${docId}?draft=true`, {
      headers: admin,
      data: { description: doc(p(text("Rozpracovaný popis."))), _status: "draft" },
    })
    expect(draft.status(), await draft.text()).toBe(200)
    await page.goto(PRODUCT_PAGE)
    await expect(page.getByTestId("product-description")).toHaveText("Popis z CMS.")
    await expect(page.getByTestId("cms-preview-bar")).toHaveCount(0)
  })

  test("a share link shows the draft, read-only", async ({ page, request }) => {
    const latest = await (await request.get(`${SHOP}/api/products/${docId}?draft=true`, { headers: admin })).json()
    expect(latest.shareLink).toContain("/api/cms/preview?")
    await page.goto(latest.shareLink)
    await expect(page).toHaveURL(new RegExp(`${PRODUCT_PAGE}$`))
    await expect(page.getByTestId("product-description")).toHaveText("Rozpracovaný popis.")
    await expect(page.getByTestId("cms-preview-bar")).toBeVisible()
    await expect(page.getByTestId("cms-preview-bar").getByText("Upravit v CMS")).toHaveCount(0)
  })

  test("a rename waits for the editor's draft, then applies", async ({ request }) => {
    const renamed = { ...saleProduct, title: "Akční produkt (nový název)" }
    const waiting = await sync(request, [renamed])
    expect((await waiting.json()).pending).toEqual([saleProduct.id])
    const latest = await (await request.get(`${SHOP}/api/products/${docId}?draft=true`, { headers: admin })).json()
    expect(latest._status).toBe("draft")
    expect(latest.title).toBe("Akční produkt")

    await request.patch(`${SHOP}/api/products/${docId}`, { headers: admin, data: { _status: "published" } })
    const applied = await sync(request, [renamed])
    expect((await applied.json()).renamed).toEqual([saleProduct.id])
    const after = await (await request.get(`${SHOP}/api/products/${docId}?draft=true`, { headers: admin })).json()
    expect(after.title).toBe(renamed.title)
    expect(after._status).toBe("published")
    // The rename kept the editor's published texts.
    expect(JSON.stringify(after.description)).toContain("Rozpracovaný popis.")
  })

  test("an image inserted in a text shows with its alt text", async ({ page, request }) => {
    const media = await ensureImage(request, admin, "Balení akčního produktu")
    const image = { type: "upload", version: 3, format: "", fields: null, id: crypto.randomUUID().replaceAll("-", "").slice(0, 24), relationTo: "media", value: media }
    const res = await request.patch(`${SHOP}/api/products/${docId}`, {
      headers: admin,
      data: { description: doc(p(text("Popis s obrázkem.")), image), _status: "published" },
    })
    expect(res.status(), await res.text()).toBe(200)
    await page.goto(PRODUCT_PAGE)
    const description = page.getByTestId("product-description")
    await expect(description).toContainText("Popis s obrázkem.")
    await expect(description.getByRole("img", { name: "Balení akčního produktu" })).toBeVisible()
  })

  test("deleting the product in Medusa deletes its document", async ({ page, request }) => {
    const res = await remove(request, [saleProduct.id])
    expect((await res.json()).deleted).toEqual([saleProduct.id])
    await page.goto(PRODUCT_PAGE)
    await expect(page.getByTestId("product-description")).toHaveText("Popis produktu")
  })
})
