import assert from "node:assert/strict"
import test from "node:test"
import { byOrder, monogram } from "../src/lib/util/clinic.ts"

const item = (title, poradi) => ({ title, metadata: poradi === undefined ? {} : { poradi } })

test("items follow the admin order; unordered ones come last by title", () => {
  const sorted = byOrder([item("Žofie"), item("B", 2), item("Čeněk"), item("A", 1)])
  assert.deepEqual(sorted.map((i) => i.title), ["A", "B", "Čeněk", "Žofie"])
})

test("monograms use the stored letter, else the first name's initial", () => {
  assert.equal(monogram("Štěpánka Očenášová", "š"), "Š")
  assert.equal(monogram("Mgr. Judita Halvová", null), "J")
  assert.equal(monogram("MUDr. Boris Jegorov"), "B")
})

const category = (slug, poradi) => ({ slug, title: slug, metadata: { poradi } })
const procedure = (slug, kategorie, extra = {}) => ({
  slug,
  title: slug,
  metadata: { kategorie, ...extra },
})
