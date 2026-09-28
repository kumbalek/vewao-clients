import assert from "node:assert/strict"
import test from "node:test"
import { byOrder, monogram, parsePriceList, splitAtFirstHeading } from "../src/lib/util/clinic.ts"

const item = (title, poradi) => ({ title, metadata: poradi === undefined ? {} : { poradi } })

test("items follow the admin order; unordered ones come last by title", () => {
  const sorted = byOrder([item("Žofie"), item("B", 2), item("Čeněk"), item("A", 1)])
  assert.deepEqual(sorted.map((i) => i.title), ["A", "B", "Čeněk", "Žofie"])
})

test("price list rows split on the first em dash; prices may contain pipes", () => {
  assert.deepEqual(
    parsePriceList("Akupunktura — 3.500 Kč | Akce 5x sezení 10.000 Kč\n\n  Bez ceny  "),
    [
      { title: "Akupunktura", price: "3.500 Kč | Akce 5x sezení 10.000 Kč" },
      { title: "Bez ceny", price: "" },
    ]
  )
  assert.deepEqual(parsePriceList(null), [])
})

test("rendered HTML splits before the first h2 only", () => {
  const html = "<p>Úvod</p>\n<h2>Na co se zaměřujeme?</h2><h3>Dermatologie</h3><h2>Další</h2>"
  assert.deepEqual(splitAtFirstHeading(html), [
    "<p>Úvod</p>\n",
    "<h2>Na co se zaměřujeme?</h2><h3>Dermatologie</h3><h2>Další</h2>",
  ])
  assert.deepEqual(splitAtFirstHeading("<p>Jen text</p>"), ["<p>Jen text</p>", ""])
})

test("monograms use the stored letter, else the first name's initial", () => {
  assert.equal(monogram("Štěpánka Očenášová", "š"), "Š")
  assert.equal(monogram("Mgr. Judita Halvová", null), "J")
  assert.equal(monogram("MUDr. Boris Jegorov"), "B")
})
