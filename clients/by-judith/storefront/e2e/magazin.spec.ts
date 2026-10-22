import { expect as baseExpect, test } from "@playwright/test"

import { E2E_PAYLOAD_SECRET } from "../playwright.config"
import { previewSecret, signPreview } from "../src/lib/cms/preview-token"
import {
  BOLD,
  NEEDS_PAYLOAD,
  SHOP,
  ensureDoc,
  ensureImage,
  hasPayload,
  lexical,
  payloadAuth,
  type Auth,
} from "./support/payload"

const { doc, p, text, br, link } = lexical
const expect = baseExpect.configure({ timeout: 15_000 })

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: "_medusa_cache_id", value: crypto.randomUUID(), url: SHOP, sameSite: "Lax" },
  ])
})

test("the header links to the magazine", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop navigation")
  await page.goto("/cz")
  await page.getByRole("navigation", { name: "Hlavní navigace" }).getByRole("link", { name: "Magazín" }).click()
  await expect(page).toHaveURL(/\/cz\/magazin$/)
})

test.describe("the magazine from the CMS", () => {
  test.skip(!hasPayload, NEEDS_PAYLOAD)

  // Three published articles; creation order (oldest first) is the magazine's order.
  test.beforeAll(async ({ request }) => {
    const auth = await payloadAuth(request)
    const photo = await ensureImage(request, auth, "Testovací fotografie")
    const treatment = await ensureImage(request, auth, "Ošetření")
    const acupuncture = await ensureDoc(request, auth, "topics", "name", "akupunktura", {})
    const herbs = await ensureDoc(request, auth, "topics", "name", "fytoterapie", {})
    const article = (slug: string, data: Record<string, unknown>) =>
      ensureDoc(request, auth, "articles", "slug", slug, { ...data, _status: "published" })

    await article("akupunktura-v-praxi", {
      title: "Akupunktura v praxi",
      excerpt: "Jak probíhá ošetření.",
      body: doc(p(text("Jak probíhá ošetření."))),
      topics: [acupuncture, herbs],
      image: treatment,
    })
    await article("o-bylinach", {
      title: "O bylinách",
      body: doc(p(text("Byliny "), text("pomáhají", BOLD), text("."))),
    })
    await article("rozhovor-s-testovaci-klientkou", {
      title: "Rozhovor s testovací klientkou",
      excerpt: "Perex testovacího rozhovoru.",
      body: doc(
        p(text("Jak jste se k nám dostala?", BOLD), br(), text("A proč právě akupunktura?", BOLD)),
        p(text("Díky "), link("https://example.com/", text("doporučení")), text("."))
      ),
      topics: [acupuncture],
      image: photo,
    })
  })

  test("the magazine features the newest article and lists the rest", async ({ page }) => {
    await page.goto("/cz/magazin")
    await expect(page.getByRole("heading", { level: 1, name: "Magazín" })).toBeVisible()

    const featured = page.getByTestId("featured-article")
    await expect(featured.getByRole("link", { name: "Rozhovor s testovací klientkou" })).toHaveAttribute(
      "href",
      "/cz/magazin/rozhovor-s-testovaci-klientkou"
    )
    await expect(featured).toContainText("Doporučeno · Akupunktura")

    const cards = page.getByTestId("article-card")
    await expect(cards).toHaveCount(2)
    // Without a perex, a card teases the start of the article as plain text.
    await expect(cards.first()).toContainText("O bylinách")
    await expect(cards.first()).toContainText("Byliny pomáhají.")

    const topics = page.getByRole("navigation", { name: "Témata" })
    await expect(topics.getByRole("link", { name: "Vše" })).toHaveAttribute("aria-current", "page")
    await expect(topics.getByRole("link")).toHaveText(["Vše", "Akupunktura", "Fytoterapie"])
  })

  test("a topic narrows the list and is marked current", async ({ page }) => {
    await page.goto("/cz/magazin")
    const topics = page.getByRole("navigation", { name: "Témata" })
    await topics.getByRole("link", { name: "Fytoterapie" }).click()

    await expect(page).toHaveURL(/\/cz\/magazin\?tag=fytoterapie$/)
    await expect(topics.getByRole("link", { name: "Fytoterapie" })).toHaveAttribute("aria-current", "page")
    await expect(page.getByTestId("featured-article")).toHaveCount(0)
    await expect(page.getByTestId("article-card")).toHaveCount(1)
    await expect(page.getByTestId("article-card")).toContainText("Akupunktura v praxi")
  })

  test("an article shows its text, image and related reads", async ({ page }) => {
    await page.goto("/cz/magazin/rozhovor-s-testovaci-klientkou")
    await expect(page).toHaveTitle("Rozhovor s testovací klientkou")
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Rozhovor s testovací klientkou")
    await expect(page.getByRole("img", { name: "Testovací fotografie" })).toBeVisible()

    const body = page.getByTestId("article-body")
    await expect(body.locator("strong").first()).toHaveText("Jak jste se k nám dostala?")
    await expect(body.getByRole("link", { name: "doporučení" })).toHaveAttribute("rel", /noopener/)

    // No newsletter provider yet: the sign-up is a marked placeholder, not a fake form.
    const newsletter = page.getByRole("complementary", { name: "Chcete zasílat magazín?" })
    await expect(newsletter.locator("[data-placeholder]")).toHaveCount(1)
    await expect(newsletter.getByRole("textbox")).toHaveCount(0)

    // An article sharing the "akupunktura" topic comes first.
    const related = page.getByRole("region", { name: "Související články" })
    await expect(related.getByTestId("article-card").first()).toContainText("Akupunktura v praxi")
    // Visitors never see the preview's controls.
    await expect(page.getByTestId("cms-preview-bar")).toHaveCount(0)
    await expect(page.getByTestId("cms-edit-link")).toHaveCount(0)
  })

  test("an unknown article is a 404", async ({ page }) => {
    const response = await page.goto("/cz/magazin/neexistuje")
    expect(response?.status()).toBe(404)
  })

  test.describe("drafts and preview", () => {
    // The steps build on each other; the article is deleted at the end so
    // the other project's run sees the fixtures alone.
    test.describe.configure({ mode: "serial" })
    test.beforeEach(({ isMobile }) => {
      test.skip(isMobile, "CMS flow runs once")
    })

    const slug = `e2e-clanek-${Date.now()}`
    const path = `/cz/magazin/${slug}`
    let auth: Auth
    let id = 0

    test.beforeAll(async ({ request }) => {
      auth = await payloadAuth(request)
    })
    test.afterAll(async ({ request }) => {
      if (id) await request.delete(`${SHOP}/api/articles/${id}`, { headers: auth })
    })

    test("a draft article is not public", async ({ page, request }) => {
      const res = await request.post(`${SHOP}/api/articles?draft=true`, {
        headers: auth,
        data: { title: "E2E článek", slug, body: doc(p(text("Koncept článku."))) },
      })
      expect(res.status()).toBe(201)
      id = (await res.json()).doc.id

      expect((await page.goto(path))?.status()).toBe(404)
      await page.goto("/cz/magazin")
      await expect(page.getByText("E2E článek")).toHaveCount(0)
    })

    test("the share link shows the draft read-only", async ({ browser, request }) => {
      const { shareLink } = await (await request.get(`${SHOP}/api/articles/${id}?draft=true`, { headers: auth })).json()
      expect(shareLink).toContain("mode=view")

      const context = await browser.newContext()
      const page = await context.newPage()
      await page.goto(shareLink)
      await expect(page).toHaveURL(new RegExp(`${path}$`))
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("E2E článek")
      await expect(page.getByTestId("article-body")).toHaveText("Koncept článku.")
      await expect(page.getByTestId("cms-preview-bar")).toContainText("Náhled konceptu")
      await expect(page.getByTestId("cms-edit-link")).toHaveCount(0)
      await context.close()
    })

    test("an edit preview links the article to the CMS", async ({ browser }) => {
      // What Live Preview opens: an edit-mode link signed with the CMS secret.
      const expires = Math.floor(Date.now() / 1000) + 600
      const secret = previewSecret({ PAYLOAD_SECRET: E2E_PAYLOAD_SECRET })!
      const signature = signPreview(secret, path, expires, "edit")
      const query = new URLSearchParams({ path, expires: String(expires), mode: "edit", signature })

      const context = await browser.newContext()
      const page = await context.newPage()
      await page.goto(`/api/cms/preview?${query}`)
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("E2E článek")
      await expect(page.getByTestId("cms-edit-link")).toHaveAttribute("href", `/admin/collections/articles/${id}`)
      await expect(page.getByTestId("cms-preview-bar").getByRole("link", { name: "Upravit v CMS" })).toHaveAttribute(
        "href",
        `/admin/collections/articles/${id}`
      )
      await context.close()
    })

    test("publishing puts the article on the magazine at once", async ({ page, request }) => {
      const res = await request.patch(`${SHOP}/api/articles/${id}`, { headers: auth, data: { _status: "published" } })
      expect(res.ok()).toBe(true)

      await page.goto("/cz/magazin")
      await expect(page.getByTestId("featured-article")).toContainText("E2E článek")
      await page.goto(path)
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("E2E článek")
      await expect(page.getByTestId("cms-preview-bar")).toHaveCount(0)
    })
  })
})
