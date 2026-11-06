import assert from "node:assert/strict"
import test from "node:test"
import { currencySymbol, regionOptions } from "../src/lib/util/region-options.ts"

test("currency symbols are written as the shop writes prices", () => {
  assert.equal(currencySymbol("czk"), "Kč")
  assert.equal(currencySymbol("eur"), "€")
})

test("delivery countries come from the regions, in the shop's order, named in Czech", () => {
  const regions = [
    { currency_code: "eur", countries: [{ iso_2: "sk" }] },
    { currency_code: "czk", countries: [{ iso_2: "cz" }, { iso_2: "xx" }] },
  ]
  assert.deepEqual(regionOptions(regions, { cz: "Česko", sk: "Slovensko" }), [
    { countryCode: "cz", label: "Česko", currencySymbol: "Kč" },
    { countryCode: "sk", label: "Slovensko", currencySymbol: "€" },
  ])
  assert.deepEqual(regionOptions([], { cz: "Česko" }), [])
})
