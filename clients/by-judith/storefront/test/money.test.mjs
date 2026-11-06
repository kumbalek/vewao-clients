import assert from "node:assert/strict"
import test from "node:test"
import { convertToLocale } from "../src/lib/util/money.ts"

const czk = (amount) => convertToLocale({ amount, currency_code: "czk" })
const eur = (amount) => convertToLocale({ amount, currency_code: "eur" })

test("crowns are whole, with dots between thousands", () => {
  assert.equal(czk(1890), "1.890 Kč")
  assert.equal(czk(590), "590 Kč")
  assert.equal(czk(150000), "150.000 Kč")
  assert.equal(czk(0), "0 Kč")
})

test("euros keep their cents and the shop's separators", () => {
  assert.equal(eur(75.9), "75,90 €")
  assert.equal(eur(8), "8,00 €")
  assert.equal(eur(1234.5), "1.234,50 €")
  assert.equal(eur(0), "0,00 €")
})

test("negative amounts and explicit digits", () => {
  assert.equal(czk(-150), "-150 Kč")
  assert.equal(convertToLocale({ amount: 12.5, currency_code: "czk", maximumFractionDigits: 2 }), "12,5 Kč")
  assert.equal(convertToLocale({ amount: 12, currency_code: "" }), "12")
})
