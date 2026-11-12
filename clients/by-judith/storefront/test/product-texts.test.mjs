import assert from "node:assert/strict"
import test from "node:test"
import { parseIngredients, parseDeleteIds, parseSyncProducts, productTextsFromMedusa, syncAction } from "../src/lib/cms/product-texts.ts"

test("legacy JSON arrays keep one entry per ingredient", () => {
  const raw = '[     "Meruňka obecná (extrakt ze semene) 960 mg",     "protispékavé látky: oxid křemičitý" ]'
  assert.deepEqual(parseIngredients(raw), [
    [{ text: "Meruňka obecná (extrakt ze semene) 960 mg", allergen: false }],
    [{ text: "protispékavé látky: oxid křemičitý", allergen: false }],
  ])
})

test("marked allergens become emphasised segments", () => {
  assert.deepEqual(parseIngredients('["**Hořčice** setá (extrakt ze semene) 640 mg", "sója a **mléko**, **celer**"]'), [
    [{ text: "Hořčice", allergen: true }, { text: " setá (extrakt ze semene) 640 mg", allergen: false }],
    [{ text: "sója a ", allergen: false }, { text: "mléko", allergen: true }, { text: ", ", allergen: false }, { text: "celer", allergen: true }],
  ])
})

test("plain text and broken JSON fall back to lines; empty values give nothing", () => {
  assert.deepEqual(parseIngredients("Šalvěj 10 mg\n\n**Sezam**"), [
    [{ text: "Šalvěj 10 mg", allergen: false }],
    [{ text: "Sezam", allergen: true }],
  ])
  assert.deepEqual(parseIngredients('["neuzavřený'), [[{ text: '["neuzavřený', allergen: false }]])
  assert.deepEqual(parseIngredients(undefined), [])
  assert.deepEqual(parseIngredients("  "), [])
})

// Lexical JSON shorthands: the node types and text that the shop renders.
const shape = (node) =>
  node.type === "text"
    ? (node.format & 1 ? `**${node.text}**` : node.text)
    : node.type === "linebreak"
      ? "\n"
      : { [node.type]: (node.children ?? []).map(shape) }

test("legacy Medusa texts become Payload fields", () => {
  const texts = productTextsFromMedusa({
    subtitle: "  Bylinný komplex  ",
    description: "První odstavec.\nDruhý řádek.\n\n\nDruhý odstavec.",
    metadata: {
      dose: "1 kapsle denně;  ; Zapít vodou.",
      ingredients: JSON.stringify(["Meruňka 960 mg", "**Hořčice** setá 640 mg"]),
      informations: "Není náhradou stravy.;Skladujte v suchu.",
      weight: "Hmotnost: 30 g",
    },
  })
  assert.equal(texts.subtitle, "Bylinný komplex")
  assert.deepEqual(shape(texts.description.root), {
    root: [{ paragraph: ["První odstavec.", "\n", "Druhý řádek."] }, { paragraph: ["Druhý odstavec."] }],
  })
  assert.deepEqual(shape(texts.dosage.root), { root: [{ paragraph: ["1 kapsle denně"] }, { paragraph: ["Zapít vodou."] }] })
  assert.deepEqual(shape(texts.ingredients.root), {
    root: [{ list: [{ listitem: ["Meruňka 960 mg"] }, { listitem: ["**Hořčice**", " setá 640 mg"] }] }],
  })
  assert.equal(texts.ingredients.root.children[0].listType, "bullet")
  assert.deepEqual(shape(texts.information.root), {
    root: [{ paragraph: ["Není náhradou stravy."] }, { paragraph: ["Skladujte v suchu."] }, { paragraph: ["Hmotnost: 30 g"] }],
  })
})

test("missing or non-text Medusa values give empty fields", () => {
  assert.deepEqual(productTextsFromMedusa({ subtitle: null, description: "  ", metadata: { dose: 3, ingredients: [] } }), {
    subtitle: null, description: null, dosage: null, ingredients: null, information: null,
  })
  assert.deepEqual(productTextsFromMedusa({}), {
    subtitle: null, description: null, dosage: null, ingredients: null, information: null,
  })
})

test("sync requests are validated", () => {
  const product = { id: "prod_1", handle: "allergy", title: "№ 1 Allergy", description: "Popis", metadata: { dose: "1" } }
  assert.deepEqual(parseSyncProducts({ products: [product] }), [product])
  assert.deepEqual(parseSyncProducts({ products: [] }), [])
  assert.match(parseSyncProducts({}), /must be an array/)
  assert.match(parseSyncProducts({ products: [{ id: "prod_1", handle: "", title: "x" }] }), /products\[0\] needs/)
  assert.match(parseSyncProducts({ products: [{ ...product, metadata: ["x"] }] }), /invalid texts/)
  assert.match(parseSyncProducts({ products: [{ ...product, description: 5 }] }), /invalid texts/)
  assert.match(parseSyncProducts({ products: Array(1001).fill(product) }), /at most 1000/)
  assert.deepEqual(parseDeleteIds({ ids: ["prod_1"] }), ["prod_1"])
  assert.match(parseDeleteIds({ ids: [""] }), /ids must be/)
  assert.match(parseDeleteIds(null), /ids must be/)
})

test("the sync creates, renames only published documents, and never touches content", () => {
  const product = { id: "prod_1", handle: "allergy", title: "№ 1 Allergy" }
  assert.equal(syncAction(null, product), "create")
  assert.equal(syncAction({ handle: "allergy", title: "№ 1 Allergy", _status: "draft" }, product), "unchanged")
  assert.equal(syncAction({ handle: "allergy-old", title: "№ 1 Allergy", _status: "published" }, product), "rename")
  assert.equal(syncAction({ handle: "allergy", title: "Allergy", _status: "published" }, product), "rename")
  // An editor's pending draft: renaming now would unpublish or publish it.
  assert.equal(syncAction({ handle: "allergy-old", title: "№ 1 Allergy", _status: "draft" }, product), "pending")
})
