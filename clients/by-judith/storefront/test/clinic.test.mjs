import assert from "node:assert/strict"
import test from "node:test"
import { byOrder, monogram, parsePriceList, priceListSections, splitAtFirstHeading } from "../src/lib/util/clinic.ts"

const item = (title, poradi) => ({ title, metadata: poradi === undefined ? {} : { poradi } })

test("items follow the admin order; unordered ones come last by title", () => {
  const sorted = byOrder([item("Žofie"), item("B", 2), item("Čeněk"), item("A", 1)])
  assert.deepEqual(sorted.map((i) => i.title), ["A", "B", "Čeněk", "Žofie"])
})

test("price list rows split on the first em dash; prices may contain pipes", () => {
  assert.deepEqual(
    parsePriceList("Akupunktura — 3.500 Kč | Akce 5x sezení 10.000 Kč\n\n  Bez ceny  "),
    [
      { title: "Akupunktura", price: "3.500 Kč | Akce 5x sezení 10.000 Kč" },
      { title: "Bez ceny", price: "" },
    ]
  )
  assert.deepEqual(parsePriceList(null), [])
})

test("rendered HTML splits before the first h2 only", () => {
  const html = "<p>Úvod</p>\n<h2>Na co se zaměřujeme?</h2><h3>Dermatologie</h3><h2>Další</h2>"
  assert.deepEqual(splitAtFirstHeading(html), [
    "<p>Úvod</p>\n",
    "<h2>Na co se zaměřujeme?</h2><h3>Dermatologie</h3><h2>Další</h2>",
  ])
  assert.deepEqual(splitAtFirstHeading("<p>Jen text</p>"), ["<p>Jen text</p>", ""])
})

test("monograms use the stored letter, else the first name's initial", () => {
  assert.equal(monogram("Štěpánka Očenášová", "š"), "Š")
  assert.equal(monogram("Mgr. Judita Halvová", null), "J")
  assert.equal(monogram("MUDr. Boris Jegorov"), "B")
})

const category = (slug, poradi) => ({ slug, title: slug, metadata: { poradi } })
const procedure = (slug, kategorie, extra = {}) => ({
  slug,
  title: slug,
  metadata: { kategorie, ...extra },
})

test("sections follow the categories' admin order; procedures within follow theirs", () => {
  const sections = priceListSections(
    [category("b", 2), category("a", 1)],
    [
      procedure("p2", "b", { poradi: 2, cena: "500 Kč" }),
      procedure("p1", "a", { poradi: 2, cenik: "Laser — 1.000 Kč" }),
      procedure("p0", "a", { poradi: 1, cena: "800 Kč" }),
      procedure("p3", "b", { cena: "300 Kč" }),
    ]
  )
  assert.deepEqual(sections, [
    {
      slug: "a",
      title: "a",
      procedures: [
        { slug: "p0", title: "p0", href: "/procedury/a/p0", rows: [{ title: "p0", price: "800 Kč" }] },
        { slug: "p1", title: "p1", href: "/procedury/a/p1", rows: [{ title: "Laser", price: "1.000 Kč" }] },
      ],
    },
    {
      slug: "b",
      title: "b",
      procedures: [
        { slug: "p2", title: "p2", href: "/procedury/b/p2", rows: [{ title: "p2", price: "500 Kč" }] },
        { slug: "p3", title: "p3", href: "/procedury/b/p3", rows: [{ title: "p3", price: "300 Kč" }] },
      ],
    },
  ])
})

test("cenik rows win over cena; cena alone becomes one procedure-titled row; neither omits it", () => {
  const sections = priceListSections(
    [category("a")],
    [
      procedure("both", "a", { cena: "500 Kč", cenik: "Laser — 1.000 Kč" }),
      procedure("only-cena", "a", { cena: " 500 Kč " }),
      procedure("neither", "a"),
      procedure("empty-cenik", "a", { cenik: "  \n " }),
    ]
  )
  assert.deepEqual(
    sections[0].procedures,
    [
      {
        slug: "both",
        title: "both",
        href: "/procedury/a/both",
        rows: [{ title: "Laser", price: "1.000 Kč" }],
      },
      {
        slug: "only-cena",
        title: "only-cena",
        href: "/procedury/a/only-cena",
        rows: [{ title: "only-cena", price: "500 Kč" }],
      },
    ]
  )
})

test("a category with no priced procedures is omitted; orphan procedures are ignored", () => {
  const sections = priceListSections(
    [category("empty", 1), category("priced", 2)],
    [procedure("bare", "empty"), procedure("orphan", "unknown"), procedure("kept", "priced", { cena: "1 Kč" })]
  )
  assert.deepEqual(
    sections.map((s) => s.slug),
    ["priced"]
  )
  assert.deepEqual(
    sections[0].procedures.map((p) => p.slug),
    ["kept"]
  )
})

test("priceListSections does not mutate its inputs", () => {
  const categories = [category("b", 2), category("a", 1)]
  const procedures = [procedure("p2", "b", { cena: "500 Kč" }), procedure("p1", "a", { cenik: "Laser — 1.000 Kč" })]
  const before = structuredClone({ categories, procedures })
  priceListSections(categories, procedures)
  assert.deepEqual({ categories, procedures }, before)
})
