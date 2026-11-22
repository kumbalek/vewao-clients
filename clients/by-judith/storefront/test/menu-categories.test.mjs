import assert from "node:assert/strict"
import test from "node:test"

import { categoryImage, menuCategories } from "../src/lib/util/menu-categories.ts"

const category = (id, name, rank, parent = null) => ({
  id,
  handle: id,
  name,
  rank,
  parent_category_id: parent,
})

test("top-level categories in admin order, each with its subcategories in order", () => {
  const menu = menuCategories([
    category("dp", "DP Dermaceuticals", 4),
    category("dp-masky", "DP Masky", 5, "dp"),
    category("herbs", "Herbs", 0),
    category("cisteni", "Čištění a exfoliace", 0, "dp"),
    category("tcm", "TCM", 1),
  ])
  assert.deepEqual(
    menu.map((c) => [c.title, c.children.map((child) => child.title)]),
    [
      ["Herbs", []],
      ["TCM", []],
      ["DP Dermaceuticals", ["Čištění a exfoliace", "DP Masky"]],
    ]
  )
  assert.deepEqual(menu[0], { id: "herbs", handle: "herbs", title: "Herbs", image: null, subtitle: null, children: [] })
})

test("equal ranks fall back to Czech alphabetical order; deeper levels are left out", () => {
  const menu = menuCategories([
    category("b", "Čaje", 0),
    category("a", "Byliny", 0),
    category("c", "Cukr", 0, "a"),
    category("d", "Hluboko", 0, "c"),
  ])
  assert.deepEqual(menu.map((c) => c.title), ["Byliny", "Čaje"])
  assert.deepEqual(menu[0].children.map((c) => c.title), ["Cukr"])
})

test("a box shows the description as subtitle and the metadata image", () => {
  const [herbs] = menuCategories([
    { ...category("herbs", "Herbs", 0), description: "  Bylinné tablety  ", metadata: { image: "https://cdn.example/herbs.jpg" } },
    { ...category("gold", "Gold Edition", 0, "herbs"), description: "Not shown", metadata: { image: "/static/gold.png" } },
  ])
  assert.equal(herbs.subtitle, "Bylinné tablety")
  assert.equal(herbs.image, "https://cdn.example/herbs.jpg")
  assert.deepEqual(herbs.children, [{ id: "gold", handle: "gold", title: "Gold Edition", image: "/static/gold.png" }])
  assert.equal(menuCategories([{ ...category("tcm", "TCM", 1), description: "   " }])[0].subtitle, null)
})

test("only http(s) URLs and site paths count as images", () => {
  assert.equal(categoryImage({ image: " https://a.example/x.png " }), "https://a.example/x.png")
  assert.equal(categoryImage({ image: "/static/x.png" }), "/static/x.png")
  for (const image of ["javascript:alert(1)", "//evil.example/x.png", "data:image/png;base64,AAAA", "x.png", "", 42, null]) {
    assert.equal(categoryImage({ image }), null, String(image))
  }
  assert.equal(categoryImage(null), null)
  assert.equal(categoryImage({}), null)
})
