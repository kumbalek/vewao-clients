import { expect, test } from "@playwright/test"

import { NEEDS_PAYLOAD, SHOP, hasPayload, lexical, payloadAuth, type Auth } from "./support/payload"

const { doc, p, text } = lexical

// The procedures' data model in the CMS (#43): categories, procedures and one
// level of sub-procedures. The storefront does not read it yet.
test.skip(!hasPayload, NEEDS_PAYLOAD)
test.describe.configure({ mode: "serial" })

test.describe("procedures in the CMS", () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, "CMS flow runs once")
  })

  const run = Date.now()
  let auth: Auth
  const ids: { category?: number; procedure?: number; sub?: number; draft?: number } = {}

  const create = (request: import("@playwright/test").APIRequestContext, collection: string, data: Record<string, unknown>) =>
    request.post(`${SHOP}/api/${collection}`, { headers: auth, data: { _status: "published", ...data } })
  const get = async (request: import("@playwright/test").APIRequestContext, collection: string, id: number) =>
    (await request.get(`${SHOP}/api/${collection}/${id}?depth=0`, { headers: auth })).json()

  test.beforeAll(async ({ request }) => {
    auth = await payloadAuth(request)
  })

  test.afterAll(async ({ request }) => {
    for (const id of [ids.sub, ids.draft, ids.procedure]) {
      if (id) await request.delete(`${SHOP}/api/procedures/${id}`, { headers: auth })
    }
    if (ids.category) await request.delete(`${SHOP}/api/procedure-categories/${ids.category}`, { headers: auth })
  })

  test("a category and a procedure hold the copy's fields", async ({ request }) => {
    const category = await create(request, "procedure-categories", {
      name: "E2E Západní medicína",
      slug: `e2e-zapadni-${run}`,
      title: "Západní medicína a estetická péče",
      perex: "Perex kategorie.",
      sections: [{ blockType: "textSection", heading: "Moderní postupy", content: doc(p(text("Text sekce."))) }],
      seo: { title: "Meta title", description: "Meta description", keywords: "klíčová slova" },
    })
    expect(category.status(), await category.text()).toBe(201)
    ids.category = (await category.json()).doc.id

    const procedure = await create(request, "procedures", {
      name: "E2E Injekční aplikace",
      slug: `e2e-injekcni-${run}`,
      category: ids.category,
      annotation: "Anotace na rozcestníku.",
      annotationLink: "Prohlédnout injekční ošetření →",
      priceSummary: "od 2.500 Kč",
      priceRows: [{ item: "RRS® HA Eyes", price: "2.500 Kč / 1,5 ml" }, { price: "dle doporučení", hidden: true }],
      sections: [
        { blockType: "pointsSection", heading: "Proč u nás", style: "labels", points: [{ title: "Lékařský dohled", text: "Text." }] },
        {
          blockType: "preparation",
          name: "Radiesse®",
          tagline: "Kolagenový stimulátor",
          points: [{ label: "Princip", text: doc(p(text("Mikrosféry CaHA."))) }],
        },
      ],
    })
    expect(procedure.status(), await procedure.text()).toBe(201)
    ids.procedure = (await procedure.json()).doc.id

    const stored = await get(request, "procedures", ids.procedure!)
    expect(stored.category).toBe(ids.category)
    expect(stored.priceRows.map((row: { price: string }) => row.price)).toEqual(["2.500 Kč / 1,5 ml", "dle doporučení"])
    expect(stored.sections.map((s: { blockType: string }) => s.blockType)).toEqual(["pointsSection", "preparation"])
  })

  test("a sub-procedure takes its parent's category", async ({ request }) => {
    const sub = await create(request, "procedures", {
      name: "E2E Modelace rtů",
      slug: `e2e-rty-${run}`,
      parent: ids.procedure,
      // Ignored: a sub-procedure's category is its parent's.
      category: ids.category,
    })
    expect(sub.status(), await sub.text()).toBe(201)
    ids.sub = (await sub.json()).doc.id
    const stored = await get(request, "procedures", ids.sub!)
    expect(stored.parent).toBe(ids.procedure)
    expect(stored.category).toBeNull()
  })

  test("sub-procedures have one level only", async ({ request }) => {
    const nested = await create(request, "procedures", { name: "E2E Příliš hluboko", slug: `e2e-hluboko-${run}`, parent: ids.sub })
    expect(nested.status()).toBe(400)
    expect(await nested.text()).toContain("podprocedury mají jen jednu úroveň")

    const moved = await request.patch(`${SHOP}/api/procedures/${ids.procedure}`, { headers: auth, data: { parent: ids.sub } })
    expect(moved.status()).toBe(400)
  })

  test("a procedure needs a category or a parent", async ({ request }) => {
    const orphan = await create(request, "procedures", { name: "E2E Bez kategorie", slug: `e2e-bez-${run}` })
    expect(orphan.status()).toBe(400)
    expect(await orphan.text()).toContain("Vyberte kategorii")
  })

  test("a procedure with sub-procedures cannot be deleted", async ({ request }) => {
    const res = await request.delete(`${SHOP}/api/procedures/${ids.procedure}`, { headers: auth })
    expect(res.status()).toBe(400)
    expect(await res.text()).toContain("Procedura má podprocedury")
    expect((await get(request, "procedures", ids.procedure!)).id).toBe(ids.procedure)
  })

  test("visitors see published procedures only", async ({ request, playwright }) => {
    const draft = await request.post(`${SHOP}/api/procedures?draft=true`, {
      headers: auth,
      data: { name: "E2E Koncept", slug: `e2e-koncept-${run}`, category: ids.category },
    })
    expect(draft.status(), await draft.text()).toBe(201)
    ids.draft = (await draft.json()).doc.id

    // Signing in left a session cookie in `request`; a visitor has none.
    const anonymous = await playwright.request.newContext()
    const visitor = await anonymous.get(`${SHOP}/api/procedures?where[slug][like]=e2e-&limit=50&depth=0`)
    const slugs = (await visitor.json()).docs.map((d: { slug: string }) => d.slug)
    await anonymous.dispose()
    expect(slugs).toContain(`e2e-injekcni-${run}`)
    expect(slugs).not.toContain(`e2e-koncept-${run}`)
  })
})
