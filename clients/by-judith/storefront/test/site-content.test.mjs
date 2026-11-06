import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { freeDeliveryFrom } from "../src/content/site.ts"

test("the header's free-delivery thresholds match the backend's PPL price rules", () => {
  const seed = readFileSync(new URL("../../seed/seed-dev.ts", import.meta.url), "utf8")
  for (const [currency, constant] of [["czk", "FREE_DELIVERY_FROM"], ["eur", "FREE_DELIVERY_FROM_EUR"]]) {
    const match = seed.match(new RegExp(`const ${constant} = (\\d+)`))
    assert.ok(match, `${constant} not found in seed/seed-dev.ts`)
    assert.equal(freeDeliveryFrom[currency], Number(match[1]))
  }
})
