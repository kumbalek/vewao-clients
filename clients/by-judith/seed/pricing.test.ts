import assert from "node:assert/strict"
import test from "node:test"

import { devEurPrice, eurPriceFor, HERB_EUR_PRICES, ownerEurPriceUpdate } from "./pricing.ts"

test("the herb lines have the owner's EUR prices", () => {
  assert.deepEqual(HERB_EUR_PRICES, { gold: 75, acute: 24 })
  assert.equal(eurPriceFor("gold", 1890), 75)
  assert.equal(eurPriceFor("acute", 590), 24)
})

test("other products keep a placeholder derived from CZK", () => {
  assert.equal(devEurPrice(1890), 75.9)
  assert.equal(devEurPrice(590), 23.9)
  assert.equal(eurPriceFor(null, 199), 7.9)
  assert.equal(eurPriceFor("vouchers", 500), 19.9)
})

test("the owner's price replaces only a missing price or the placeholder", () => {
  assert.equal(ownerEurPriceUpdate(undefined, 1890, 75), 75)
  assert.equal(ownerEurPriceUpdate(75.9, 1890, 75), 75)
  assert.equal(ownerEurPriceUpdate(23.9, 590, 24), 24)
  // Already the owner's price, or set in admin: left alone.
  assert.equal(ownerEurPriceUpdate(75, 1890, 75), undefined)
  assert.equal(ownerEurPriceUpdate(79, 1890, 75), undefined)
})
