import assert from "node:assert/strict"
import test from "node:test"

import { itemVoucherTitle, productVoucherTitle, VOUCHER_PRODUCT_TYPE } from "../src/lib/util/voucher.ts"

test("a product of the voucher type gets its name on the voucher; others get none", () => {
  assert.equal(VOUCHER_PRODUCT_TYPE, "Dárkový poukaz")
  assert.equal(productVoucherTitle({ title: " Blefaroplastika ", type: { value: "Dárkový poukaz" } }), "Blefaroplastika")
  assert.equal(productVoucherTitle({ title: "№ 1 Allergy", type: null }), null)
  assert.equal(productVoucherTitle({ title: "№ 1 Allergy", type: { value: "Doplněk stravy" } }), null)
  assert.equal(productVoucherTitle({ title: "  ", type: { value: "Dárkový poukaz" } }), null)
  assert.equal(productVoucherTitle(null), null)
})

test("a cart or order line uses its product snapshot", () => {
  assert.equal(itemVoucherTitle({ product_type: "Dárkový poukaz", product_title: "Facelift", title: "Poukaz" }), "Facelift")
  assert.equal(itemVoucherTitle({ product_type: "Dárkový poukaz", product_title: null, title: "Poukaz" }), "Poukaz")
  assert.equal(itemVoucherTitle({ product_type: null, product_title: "№ 1 Allergy" }), null)
  assert.equal(itemVoucherTitle(undefined), null)
})
