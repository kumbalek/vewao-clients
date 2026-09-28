import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { freeDeliveryFrom } from "../src/content/site.ts"

test("the header's free-delivery threshold matches the backend's PPL price rule", () => {
  const seed = readFileSync(new URL("../../seed/seed-dev.ts", import.meta.url), "utf8")
  const match = seed.match(/const FREE_DELIVERY_FROM = (\d+)/)
  assert.ok(match, "FREE_DELIVERY_FROM not found in seed/seed-dev.ts")
  assert.equal(freeDeliveryFrom, Number(match[1]))
})
