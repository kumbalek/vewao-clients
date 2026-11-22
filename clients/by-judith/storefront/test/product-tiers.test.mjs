import assert from "node:assert/strict"
import test from "node:test"

import { discounted, reachedTier, regularIsLowest, tiersForProduct } from "../src/lib/util/product-tiers.ts"

const tier = (code, min_count, value, product_id = "prod_partie", type = "percentage") => ({
  code, min_count, value, product_id, type, currency_code: null, message: null, teaser: null,
})

test("a product's percentage tiers, lowest threshold first", () => {
  const tiers = tiersForProduct(
    [tier("TWENTY", 2, 20), tier("OTHER", 1, 5, "prod_herb"), tier("TEN", 1, 10), tier("FIXED", 3, 500, "prod_partie", "fixed"), tier("ZERO", 4, 0)],
    "prod_partie"
  )
  assert.deepEqual(tiers.map((t) => t.code), ["TEN", "TWENTY"])
  assert.deepEqual(tiersForProduct(undefined, "prod_partie"), [])
})

test("the reached tier is the highest threshold at or below the count", () => {
  const tiers = [tier("TEN", 1, 10), tier("TWENTY", 2, 20)]
  assert.equal(reachedTier(tiers, 0), null)
  assert.equal(reachedTier(tiers, 1)?.code, "TEN")
  assert.equal(reachedTier(tiers, 2)?.code, "TWENTY")
  assert.equal(reachedTier(tiers, 5)?.code, "TWENTY")
  assert.equal(reachedTier([], 3), null)
})

test("an amount less a percentage", () => {
  assert.equal(discounted(15000, 10), 13500)
  assert.equal(discounted(32000, 20), 25600)
  assert.equal(discounted(1490, 15), 1266.5)
})

test("a volume discount strikes the regular price only when the ledger confirms it as the 30-day lowest", () => {
  const krk = { id: "v_krk", calculated_price: { calculated_amount: 15000 } }
  const dekolt = { id: "v_dekolt", calculated_price: { calculated_amount: 17000 } }
  const ref = (variant_id, current_amount, reference_price, history_complete = true) => ({ variant_id, current_amount, reference_price, history_complete })
  const both = [ref("v_krk", 15000, 15000), ref("v_dekolt", 17000, 17000)]
  assert.equal(regularIsLowest([krk, dekolt], both), true)
  assert.equal(regularIsLowest([krk], [ref("v_krk", 15000, 15000, false)]), false, "incomplete history")
  assert.equal(regularIsLowest([krk], [ref("v_krk", 15000, 12000)]), false, "lower price in the window")
  assert.equal(regularIsLowest([krk], [ref("v_krk", 16000, 16000)]), false, "ledger behind the shown price")
  assert.equal(regularIsLowest([krk], [ref("v_krk", 15000, null)]), false, "no reference")
  assert.equal(regularIsLowest([krk, dekolt], [both[0]]), false, "one variant without a reference")
  assert.equal(regularIsLowest([], both), false)
})
