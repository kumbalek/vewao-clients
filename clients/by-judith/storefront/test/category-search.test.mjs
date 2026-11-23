import assert from "node:assert/strict"
import test from "node:test"

import { foldText, searchCategories } from "../src/lib/util/category-search.ts"

const categories = [
  {
    id: "herbs", handle: "herbs", title: "Herbs", image: "/h.png", subtitle: "Bylinné tablety",
    children: [
      { id: "gold", handle: "gold-edition", title: "Gold Edition", image: null },
      { id: "acute", handle: "acute", title: "Acute", image: null },
    ],
  },
  { id: "west", handle: "estetika", title: "Západní medicína", image: null, subtitle: null, children: [] },
  {
    id: "dp", handle: "dp", title: "DP Dermaceuticals", image: null, subtitle: null,
    children: [{ id: "clean", handle: "cisteni", title: "Čištění a exfoliace", image: null }],
  },
]

test("text folds case and diacritics", () => {
  assert.equal(foldText("  Západní Medicína "), "zapadni medicina")
  assert.equal(foldText("Čištění"), "cisteni")
})

test("a top-level category brings its subcategories' products; a subcategory its own", () => {
  const herbs = searchCategories(categories, "herbs")
  assert.deepEqual(herbs.matches.map((m) => m.title), ["Herbs"])
  assert.deepEqual(herbs.ids, ["herbs", "gold", "acute"])

  const gold = searchCategories(categories, "GOLD")
  assert.deepEqual(gold.matches, [{ id: "gold", handle: "gold-edition", title: "Gold Edition", image: null, subtitle: null }])
  assert.deepEqual(gold.ids, ["gold"])
})

test("diacritics and case do not matter; short or unmatched queries find nothing", () => {
  assert.deepEqual(searchCategories(categories, "zapadni").ids, ["west"])
  assert.deepEqual(searchCategories(categories, "cisteni").matches.map((m) => m.title), ["Čištění a exfoliace"])
  assert.deepEqual(searchCategories(categories, "e").ids, [])
  assert.deepEqual(searchCategories(categories, "allergy").ids, [])
})
