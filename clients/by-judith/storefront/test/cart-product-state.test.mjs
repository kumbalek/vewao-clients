import assert from "node:assert/strict"
import test from "node:test"

import { productCartStates, removeOneAction } from "../src/lib/util/cart-product-state.ts"

test("a product's quantity adds up all its lines, whatever the variant", () => {
  const states = productCartStates([
    { id: "l1", product_id: "ultherapy", quantity: 1, created_at: "2026-11-24T10:00:00Z" },
    { id: "l2", product_id: "ultherapy", quantity: 2, created_at: "2026-11-24T10:05:00Z" },
    { id: "l3", product_id: "herb", quantity: 3, created_at: "2026-11-24T09:00:00Z" },
  ])
  assert.equal(states.get("ultherapy").quantity, 3)
  assert.equal(states.get("herb").quantity, 3)
  assert.equal(states.get("missing"), undefined)
})

test("minus takes from the most recently added line", () => {
  const states = productCartStates([
    { id: "newer", product_id: "p", quantity: 1, created_at: "2026-11-24T10:05:00Z" },
    { id: "older", product_id: "p", quantity: 4, created_at: "2026-11-24T10:00:00Z" },
  ])
  assert.deepEqual(states.get("p").lastLine, { id: "newer", quantity: 1 })
})

test("equal or missing times fall back to the cart's order", () => {
  const same = productCartStates([
    { id: "a", product_id: "p", quantity: 1, created_at: "2026-11-24T10:00:00Z" },
    { id: "b", product_id: "p", quantity: 1, created_at: "2026-11-24T10:00:00Z" },
  ])
  assert.equal(same.get("p").lastLine.id, "b")
  const untimed = productCartStates([
    { id: "a", product_id: "p", quantity: 1 },
    { id: "b", product_id: "p", quantity: 1, created_at: "not a date" },
  ])
  assert.equal(untimed.get("p").lastLine.id, "b")
  const dated = productCartStates([
    { id: "dated", product_id: "p", quantity: 1, created_at: new Date("2026-11-24T10:00:00Z") },
    { id: "untimed", product_id: "p", quantity: 1 },
  ])
  assert.equal(dated.get("p").lastLine.id, "dated")
})

test("lines without a product or a positive quantity are ignored", () => {
  const states = productCartStates([
    null,
    { id: "gift", product_id: null, quantity: 1 },
    { id: "zero", product_id: "p", quantity: 0 },
    { id: "nan", product_id: "p", quantity: "x" },
    { id: "ok", product_id: "p", quantity: "2" },
  ])
  assert.deepEqual(states.get("p"), { quantity: 2, lastLine: { id: "ok", quantity: 2 } })
  assert.equal(productCartStates(undefined).size, 0)
})

test("minus lowers a line, or removes it at its last piece", () => {
  assert.deepEqual(removeOneAction({ id: "l", quantity: 3 }), { kind: "update", lineId: "l", quantity: 2 })
  assert.deepEqual(removeOneAction({ id: "l", quantity: 1 }), { kind: "delete", lineId: "l" })
})
