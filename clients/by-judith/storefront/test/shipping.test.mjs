import assert from "node:assert/strict"
import test from "node:test"
import { cartNeedsShipping, deliveryDone } from "../src/lib/util/shipping.ts"

const voucher = { requires_shipping: false }
const goods = { requires_shipping: true }

test("only a cart of vouchers alone skips delivery", () => {
  assert.equal(cartNeedsShipping({ items: [voucher, voucher] }), false)
  assert.equal(cartNeedsShipping({ items: [voucher, goods] }), true)
  // Unknown is treated as delivered goods.
  assert.equal(cartNeedsShipping({ items: [voucher, {}] }), true)
  assert.equal(cartNeedsShipping({ items: [] }), true)
  assert.equal(cartNeedsShipping(null), true)
})

test("delivery is done with a chosen method, or when nothing is delivered", () => {
  assert.equal(deliveryDone({ items: [voucher], shipping_methods: [] }), true)
  assert.equal(deliveryDone({ items: [goods], shipping_methods: [] }), false)
  assert.equal(deliveryDone({ items: [goods], shipping_methods: [{}] }), true)
  assert.equal(deliveryDone({ items: [voucher, goods], shipping_methods: null }), false)
})
