import { test as setup } from "@playwright/test"

import { BOLD, NEEDS_PAYLOAD, ensureDoc, hasPayload, lexical, payloadAuth } from "./support/payload"

const { doc, p, text } = lexical

/**
 * CMS content the shop's specs share (#43): two categories, procedures, a
 * sub-procedure and their prices. Runs once before the desktop and mobile
 * projects; idempotent by slug, created in menu order.
 */
setup("procedure fixtures", async ({ request }) => {
  setup.skip(!hasPayload, NEEDS_PAYLOAD)
  const auth = await payloadAuth(request)
  const published = { _status: "published" }

  const east = await ensureDoc(request, auth, "procedure-categories", "slug", "vychodni-medicina", {
    ...published,
    name: "Východní medicína",
    title: "Tradiční čínská medicína",
    menuDescription: "Akupunktura, diagnostika a byliny.",
    perex: "Perex východní medicíny.",
    sections: [{ blockType: "textSection", heading: "Jak východní medicína pomáhá?", content: doc(p(text("Text kategorie."))) }],
    seo: { title: "Tradiční čínská medicína Praha | By JuditH", description: "Popis kategorie pro vyhledávače." },
  })
  const west = await ensureDoc(request, auth, "procedure-categories", "slug", "zapadni-medicina", {
    ...published,
    name: "Západní medicína",
    perex: "Perex západní medicíny.",
  })

  await ensureDoc(request, auth, "procedures", "slug", "testovaci-procedura", {
    ...published,
    name: "Testovací procedura",
    category: east,
    annotation: "Anotace testovací procedury.",
    annotationLink: "Více o testovací proceduře →",
    perex: "Perex testovací procedury.",
    priceSummary: "od 1.000 Kč",
    duration: "45 min",
    priceRows: [
      { item: "Jedno sezení", price: "1.000 Kč" },
      { item: "Balíček 5 sezení", price: "4.000 Kč" },
      { item: "Skrytý řádek", price: "1 Kč", hidden: true },
    ],
    sections: [
      { blockType: "textSection", heading: "Jak procedura působí", content: doc(p(text("Popis "), text("procedury", BOLD), text("."))) },
      { blockType: "pointsSection", heading: "Průběh", style: "steps", points: [{ title: "Diagnostika", text: "Nejdřív pulz." }, { title: "Ošetření", text: "Pak jehličky." }] },
    ],
  })
  await ensureDoc(request, auth, "procedures", "slug", "druha-procedura", { ...published, name: "Druhá procedura", category: east })
  const injections = await ensureDoc(request, auth, "procedures", "slug", "injekcni-aplikace", {
    ...published,
    name: "Injekční aplikace",
    category: west,
    ctaLabel: "Rezervovat konzultaci",
  })
  await ensureDoc(request, auth, "procedures", "slug", "modelace-rtu", {
    ...published,
    name: "Modelace rtů",
    parent: injections,
    priceRows: [{ item: "Baby Lips", price: "5.900 Kč / 0,5 ml" }],
    sections: [
      {
        blockType: "preparation",
        name: "Neauvia® Organic",
        tagline: "Modelace a hydratace rtů",
        points: [{ label: "Princip", text: doc(p(text("Kyselina hyaluronová síťovaná PEG."))) }],
      },
    ],
  })
})
