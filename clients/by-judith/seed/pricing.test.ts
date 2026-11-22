import assert from "node:assert/strict"
import test from "node:test"

import {
  devEurPrice,
  eurFromCzk,
  eurPriceFor,
  exactEurFromCzk,
  HERB_EUR_PRICES,
  ownerEurPriceUpdate,
  roundedEurUpdate,
} from "./pricing.ts"

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

test("the other ranges cost Kč ÷ 25, rounded up to a whole euro", () => {
  assert.equal(eurFromCzk(6000), 240)
  assert.equal(eurFromCzk(760), 31)
  assert.equal(eurFromCzk(1522), 61)
  assert.equal(eurFromCzk(1249), 50)
  assert.equal(eurFromCzk(14990), 600)
  assert.equal(eurFromCzk(1225), 49)
  assert.equal(exactEurFromCzk(2362), 94.48)
})

test("the rounded price replaces only a missing or the earlier unrounded one", () => {
  assert.equal(roundedEurUpdate(undefined, 760), 31)
  assert.equal(roundedEurUpdate(94.48, 2362), 95)
  // Already rounded, or set in admin: left alone.
  assert.equal(roundedEurUpdate(95, 2362), undefined)
  assert.equal(roundedEurUpdate(99, 2362), undefined)
})
