import assert from "node:assert/strict"
import { readdirSync } from "node:fs"
import test from "node:test"

import { RESERVED_SLUGS } from "../src/cms/lib/reserved-slugs.ts"
import {
  breadcrumbs,
  locate,
  priceList,
  procedureMenu,
  procedureTree,
} from "../src/lib/util/procedures.ts"

const page = (id, slug, extra = {}) => ({
  id,
  slug,
  href: `/${slug}`,
  name: slug,
  title: slug,
  perex: null,
  image: null,
  sections: [],
  seo: { title: null, description: null },
  ...extra,
})
const category = (id, slug) => page(id, slug, { menuDescription: null })
const procedure = (id, slug, { categoryId = null, parentId = null, priceRows = [], priceSummary = null } = {}) =>
  page(id, slug, {
    categoryId,
    parentId,
    priceRows,
    priceSummary,
    ctaLabel: null,
    annotation: null,
    annotationLink: null,
    duration: null,
  })

const categories = [category(1, "vychodni-medicina"), category(2, "zapadni-medicina")]
const procedures = [
  procedure(10, "diagnostika-tcm", { categoryId: 1, priceSummary: "1.500 Kč" }),
  procedure(11, "akupunktura", { categoryId: 1 }),
  procedure(20, "injekcni-aplikace", { categoryId: 2 }),
  procedure(21, "modelace-rtu", { parentId: 20, priceRows: [{ item: "Baby Lips", price: "5.900 Kč" }] }),
  procedure(22, "botulotoxin", { parentId: 20 }),
  procedure(30, "plasticka-chirurgie", { categoryId: 2 }),
]
const tree = procedureTree(categories, procedures)

test("the tree keeps menu order and puts sub-procedures under their parent", () => {
  assert.deepEqual(
    tree.map((b) => [b.category.slug, b.procedures.map((p) => [p.procedure.slug, p.children.map((c) => c.slug)])]),
    [
      ["vychodni-medicina", [["diagnostika-tcm", []], ["akupunktura", []]]],
      ["zapadni-medicina", [["injekcni-aplikace", ["modelace-rtu", "botulotoxin"]], ["plasticka-chirurgie", []]]],
    ]
  )
})

test("a slug finds a category, a procedure or a sub-procedure with its place in the tree", () => {
  assert.equal(locate(tree, "zapadni-medicina").kind, "category")

  const top = locate(tree, "injekcni-aplikace")
  assert.equal(top.parent, null)
  assert.deepEqual(top.children.map((c) => c.slug), ["modelace-rtu", "botulotoxin"])
  assert.deepEqual(top.siblings.map((s) => s.slug), ["plasticka-chirurgie"])
  assert.deepEqual(breadcrumbs(top), [{ name: "zapadni-medicina", href: "/zapadni-medicina" }])

  const sub = locate(tree, "modelace-rtu")
  assert.equal(sub.category.slug, "zapadni-medicina")
  assert.equal(sub.parent.slug, "injekcni-aplikace")
  assert.deepEqual(sub.siblings.map((s) => s.slug), ["botulotoxin"])
  assert.deepEqual(breadcrumbs(sub).map((b) => b.href), ["/zapadni-medicina", "/injekcni-aplikace"])

  assert.equal(locate(tree, "neexistuje"), null)
})

test("a procedure outside the tree is not found: no category, or a missing parent", () => {
  const orphans = procedureTree(categories, [procedure(40, "bez-kategorie"), procedure(41, "bez-rodice", { parentId: 99 })])
  assert.equal(locate(orphans, "bez-kategorie"), null)
  assert.equal(locate(orphans, "bez-rodice"), null)
})

test("the menu lists categories, procedures and sub-procedures", () => {
  const [east, west] = procedureMenu(tree)
  assert.deepEqual(east.procedures.map((p) => p.href), ["/diagnostika-tcm", "/akupunktura"])
  assert.deepEqual(west.procedures[0].children, [
    { title: "modelace-rtu", href: "/modelace-rtu" },
    { title: "botulotoxin", href: "/botulotoxin" },
  ])
})

test("Ceník lists priced procedures; a parent without prices stays as the heading of its priced sub-procedures", () => {
  const sections = priceList(tree)
  assert.deepEqual(
    sections.map((s) => [s.slug, s.entries.map((e) => [e.slug, e.rows, e.children.map((c) => [c.slug, c.rows])])]),
    [
      ["vychodni-medicina", [["diagnostika-tcm", [{ item: null, price: "1.500 Kč" }], []]]],
      ["zapadni-medicina", [["injekcni-aplikace", [], [["modelace-rtu", [{ item: "Baby Lips", price: "5.900 Kč" }]]]]]],
    ]
  )
})

test("reserved slugs are exactly the shop's page folders next to /<slug>", () => {
  const dir = new URL("../src/app/(storefront)/[countryCode]/(main)/", import.meta.url)
  const folders = readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("[") && !d.name.startsWith("("))
    .map((d) => d.name)
    .sort()
  assert.deepEqual([...RESERVED_SLUGS].sort(), folders)
})
