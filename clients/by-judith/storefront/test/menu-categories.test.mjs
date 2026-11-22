import assert from "node:assert/strict"
import test from "node:test"

import { menuCategories } from "../src/lib/util/menu-categories.ts"

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
  assert.deepEqual(menu[0], { id: "herbs", handle: "herbs", title: "Herbs", children: [] })
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
