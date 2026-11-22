import assert from "node:assert/strict"
import test from "node:test"

import { discounted, reachedTier, tiersForProduct } from "../src/lib/util/product-tiers.ts"

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
