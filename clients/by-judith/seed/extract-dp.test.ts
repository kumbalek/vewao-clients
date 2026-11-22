import assert from "node:assert/strict"
import test from "node:test"

import { productFromPage, productLinks, subcategoryLinks, text, upgatesData } from "./extract-dp.ts"

// Fragments shaped like shop.bbclinic.cz (Upgates), 2026-11-22.
const product = (data: object, extra = "") =>
  `<meta property="og:image" content="https://cdn.example/p.png"><script>var upgates = ${JSON.stringify(data)};</script>${extra}`

test("text decodes entities and collapses markup", () => {
  assert.equal(text("<a>\n CLEANSE &amp; HYDRATE&#8482;</a> "), "CLEANSE & HYDRATE™")
  assert.equal(text("Kondicion&eacute;r&nbsp;<b>300</b>&#x20;ml"), "Kondicion&eacute;r 300 ml")
})

test("the upgates data is read by its braces, strings included", () => {
  const html = `<script>var upgates = {"product":{"title":"A } B","price":{"withVat":10}}}; other()</script>`
  assert.equal(upgatesData(html).product?.title, "A } B")
})

test("subcategory tiles come from the main content in order, once each", () => {
  const html = `<nav><a href="https://shop.bbclinic.cz/menu-only" class="d-block">Menu</a></nav><main>
    <a href="https://shop.bbclinic.cz/cisteni-a-exfoliace" class="mb-2 br-img"><img></a>
    <a href="https://shop.bbclinic.cz/cisteni-a-exfoliace" class="d-block font-weight">Čištění a exfoliace</a>
    <a href="https://shop.bbclinic.cz/spf-ochrana-cover-recover" class="d-block font-weight">SPF</a></main>`
  assert.deepEqual(subcategoryLinks(html), [
    { slug: "cisteni-a-exfoliace", title: "Čištění a exfoliace" },
    { slug: "spf-ochrana-cover-recover", title: "SPF" },
  ])
})

test("product links follow the listing", () => {
  const html = `<h4 class="p-i-header"><a href="/p/b">B</a></h4><h4 class="p-i-header"> <a href="/p/a">A</a></h4><a href="/p/b">B</a>`
  assert.deepEqual(productLinks(html), ["/p/b", "/p/a"])
})

test("a product without a variant select is one variant", () => {
  const html = product({ product: { code: "P00001", title: "TRI-PHASE CLEANSER™ 60 ml", price: { withVat: 760, vatRate: 21 }, options: [] } })
  assert.deepEqual(productFromPage(html, "/p/x"), {
    handle: "tri-phase-cleanser-60-ml",
    title: "TRI-PHASE CLEANSER™ 60 ml",
    source_url: "https://shop.bbclinic.cz/p/x",
    sku: "P00001",
    price_czk: 760,
    vat_rate: 21,
    image: "https://cdn.example/p.png",
    option: null,
    variants: [{ title: "TRI-PHASE CLEANSER™ 60 ml", sku: "P00001", price_czk: 760 }],
  })
})

test("a variant select pairs its choices with the priced options in order", () => {
  const html = product(
    {
      product: {
        code: "P00014",
        title: "R.E.R EYE SERUM™",
        price: { withVat: 2362, vatRate: 21 },
        options: [
          { code: "P00014-1", price: { withVat: 2362, vatRate: 21 } },
          { code: "P00014-2", price: { withVat: 5990, vatRate: 21 } },
        ],
      },
    },
    `<label for="frm-options-15">Množství</label><select name="options[15]"><option value="--">Vyberte ...</option><option value="15">15 ml</option><option value="16">50 ml</option></select>`
  )
  const parsed = productFromPage(html, "/p/r-e-r-eye-serum")
  assert.equal(parsed.handle, "r-e-r-eye-serum")
  assert.equal(parsed.option, "Množství")
  assert.deepEqual(parsed.variants, [
    { title: "15 ml", sku: "P00014-1", price_czk: 2362 },
    { title: "50 ml", sku: "P00014-2", price_czk: 5990 },
  ])
})

test("a select that does not match the priced options is refused", () => {
  const html = product(
    { product: { code: "P1", title: "X", price: { withVat: 1, vatRate: 21 }, options: [{ code: "P1-1", price: { withVat: 1, vatRate: 21 } }] } },
    `<select name="options[1]"><option value="--">-</option><option value="1">A</option><option value="2">B</option></select>`
  )
  assert.throws(() => productFromPage(html, "/p/x"), /2 choices but 1 priced options/)
})
