import assert from "node:assert/strict"
import test from "node:test"
import { freeShippingTarget } from "../src/lib/util/free-shipping.ts"

// The seed's free PPL price: item_total gt 4999.99 (free from 5 000 Kč).
const freeFrom5000 = { attribute: "item_total", operator: "gt", value: "4999.99" }

test("a strict threshold asks for whole koruna, not an extra one", () => {
  const t = freeShippingTarget(1890, freeFrom5000)
  assert.equal(t.target_reached, false)
  assert.equal(t.target_remaining, 3110)
})

test("exactly 5 000 Kč reaches free delivery", () => {
  assert.equal(freeShippingTarget(5000, freeFrom5000).target_reached, true)
  assert.equal(freeShippingTarget(5000, freeFrom5000).target_remaining, 0)
})

test("an inclusive threshold is reached at the threshold itself", () => {
  const gte = { attribute: "item_total", operator: "gte", value: "5000" }
  assert.equal(freeShippingTarget(5000, gte).target_reached, true)
  assert.equal(freeShippingTarget(4999, gte).target_remaining, 1)
})
