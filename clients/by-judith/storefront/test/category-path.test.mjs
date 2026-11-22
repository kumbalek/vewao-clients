import assert from "node:assert/strict"
import test from "node:test"

import { productCategoryPath } from "../src/lib/util/category-path.ts"

const herbs = { name: "Herbs", handle: "herbs" }

test("a subcategory follows its parent", () => {
  assert.deepEqual(productCategoryPath([{ name: "Gold Edition", handle: "gold-edition", parent_category: herbs }]), [
    { name: "Herbs", handle: "herbs" },
    { name: "Gold Edition", handle: "gold-edition" },
  ])
})

test("the most specific category wins, then the first one", () => {
  const tcm = { name: "TCM", handle: "tcm", parent_category: null }
  const masky = { name: "DP Masky", handle: "dp-masky", parent_category: { name: "DP Dermaceuticals", handle: "dp-dermaceuticals" } }
  assert.deepEqual(productCategoryPath([tcm, masky]).map((c) => c.name), ["DP Dermaceuticals", "DP Masky"])
  assert.deepEqual(productCategoryPath([tcm, null]), [{ name: "TCM", handle: "tcm" }])
})

test("no categories, no crumbs", () => {
  assert.deepEqual(productCategoryPath(undefined), [])
  assert.deepEqual(productCategoryPath([]), [])
})
