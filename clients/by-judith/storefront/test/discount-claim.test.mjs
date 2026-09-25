import assert from "node:assert/strict"
import test from "node:test"
import { claimForPrice, discountClaim } from "../src/lib/util/discount-claim.ts"

const onSale = {
  variant_id: "v1",
  current_amount: 1490,
  reference_price: 1890,
  history_complete: true,
}

test("a sale is announced against the 30-day lowest price", () => {
  assert.deepEqual(discountClaim(1490, onSale), { referenceAmount: 1890, percentage: 21 })
})

test("the percentage is rounded down, never overstated", () => {
  // 400 / 1890 = 21.16 %; 1 / 3 of 900 = 33.33 %
  assert.equal(discountClaim(600, { ...onSale, current_amount: 600, reference_price: 900 }).percentage, 33)
})

test("no claim without 30 days of recorded history", () => {
  assert.equal(discountClaim(1490, { ...onSale, history_complete: false }), null)
})

test("no claim when the ledger has not caught up with the displayed price", () => {
  assert.equal(discountClaim(1290, onSale), null)
})

test("no claim when the 30-day lowest is not higher than the sale price", () => {
  assert.equal(discountClaim(1490, { ...onSale, reference_price: 1490 }), null)
  assert.equal(discountClaim(1490, { ...onSale, reference_price: 1390 }), null)
})

test("no claim without ledger data", () => {
  assert.equal(discountClaim(1490, undefined), null)
  assert.equal(discountClaim(1490, { ...onSale, reference_price: null }), null)
  assert.equal(discountClaim(1490, { ...onSale, current_amount: null }), null)
})

test("a reduction below one percent is not announced", () => {
  assert.equal(discountClaim(1885, { ...onSale, current_amount: 1885 }), null)
})

test("only sale price lists are announced, against their own variant's reference", () => {
  const price = { price_type: "sale", calculated_price_number: 1490, variant_id: "v1" }
  assert.deepEqual(claimForPrice(price, [onSale]), { referenceAmount: 1890, percentage: 21 })
  assert.equal(claimForPrice({ ...price, price_type: "default" }, [onSale]), null)
  assert.equal(claimForPrice({ ...price, variant_id: "v2" }, [onSale]), null)
  assert.equal(claimForPrice(null, [onSale]), null)
})
