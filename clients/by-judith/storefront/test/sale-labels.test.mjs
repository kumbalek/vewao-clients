import assert from "node:assert/strict"
import test from "node:test"

import {
  categoryHandle,
  categoryLineage,
  runningSaleLabels,
  saleLabelsForCart,
  saleLabelsForCategories,
  toSaleLabels,
} from "../src/lib/util/sale-labels.ts"

const labels = toSaleLabels([
  { code: "VANOCE-HERBS-2PLUS1", label: "2 + 1 ZDARMA", description: " Třetí bylinka zdarma. ", categories: ["/categories/Herbs", "acute"] },
  { code: "Vánoční ceny", label: "Vánoční ceny", description: "", categories: ["poukazy"], showInCart: true },
  { code: "HIDDEN-IN-CART", label: "Jen v kategorii", categories: ["herbs"], showInCart: false },
  { code: " ", label: "Bez kódu" },
  { code: "NO-LABEL", label: "" },
  null,
])

const active = { promotions: ["VANOCE-HERBS-2PLUS1", "HIDDEN-IN-CART"], price_lists: ["Vánoční ceny"] }

test("documents become labels: trimmed, handles normalised, incomplete ones left out", () => {
  assert.equal(categoryHandle(" /categories/Gold-Edition/ "), "gold-edition")
  assert.deepEqual(
    labels.map((l) => [l.code, l.description, l.categories, l.showInCart]),
    [
      ["VANOCE-HERBS-2PLUS1", "Třetí bylinka zdarma.", ["herbs", "acute"], true],
      ["Vánoční ceny", null, ["poukazy"], true],
      ["HIDDEN-IN-CART", null, ["herbs"], false],
    ]
  )
})

test("only running sales keep their labels", () => {
  assert.deepEqual(
    runningSaleLabels(labels, { promotions: ["VANOCE-HERBS-2PLUS1"], price_lists: [] }).map((l) => l.code),
    ["VANOCE-HERBS-2PLUS1"]
  )
  assert.deepEqual(runningSaleLabels(labels, { promotions: [], price_lists: [] }), [])
})

test("a category shows its own labels and its parents'", () => {
  const gold = { handle: "gold-edition", parent_category: { handle: "herbs", parent_category: null } }
  assert.deepEqual(categoryLineage(gold), ["gold-edition", "herbs"])
  assert.deepEqual(saleLabelsForCategories(labels, [gold]).map((l) => l.code), ["VANOCE-HERBS-2PLUS1", "HIDDEN-IN-CART"])
  assert.deepEqual(saleLabelsForCategories(labels, [{ handle: "acute" }]).map((l) => l.code), ["VANOCE-HERBS-2PLUS1"])
  assert.deepEqual(saleLabelsForCategories(labels, [{ handle: "dp" }, null]), [])
})

test("the cart lists applied promotions and a running price list once an item is on a sale price", () => {
  const herbs = { promotions: [{ code: "VANOCE-HERBS-2PLUS1" }, { code: "HIDDEN-IN-CART" }], items: [{ unit_price: 1890, compare_at_unit_price: null }] }
  assert.deepEqual(saleLabelsForCart(labels, active, herbs).map((l) => l.code), ["VANOCE-HERBS-2PLUS1"])

  const voucher = { promotions: [], items: [{ unit_price: 6600, compare_at_unit_price: 7900 }] }
  assert.deepEqual(saleLabelsForCart(labels, active, voucher).map((l) => l.code), ["Vánoční ceny"])

  // Not applied, not running, or no sale price: nothing.
  assert.deepEqual(saleLabelsForCart(labels, active, { promotions: [], items: [{ unit_price: 1890, compare_at_unit_price: 1890 }] }), [])
  assert.deepEqual(saleLabelsForCart(labels, { promotions: [], price_lists: [] }, { ...herbs, ...voucher }), [])
  assert.deepEqual(saleLabelsForCart(labels, active, null), [])
})
