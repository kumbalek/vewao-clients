import assert from "node:assert/strict"
import test from "node:test"

import { hasPriceRange } from "../src/lib/util/price-range.ts"

const variant = (amount) => ({ calculated_price: { calculated_amount: amount } })

test("a product has a price range when its variants cost different amounts", () => {
  assert.equal(hasPriceRange({ variants: [variant(6000), variant(12000)] }), true)
  assert.equal(hasPriceRange({ variants: [variant(1890), variant(1890)] }), false)
  assert.equal(hasPriceRange({ variants: [variant(1890)] }), false)
  assert.equal(hasPriceRange({ variants: [variant(1890), { calculated_price: null }] }), false)
  assert.equal(hasPriceRange(null), false)
})
