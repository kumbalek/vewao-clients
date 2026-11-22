import assert from "node:assert/strict"
import test from "node:test"

import { catalogueRevalidate, DEFAULT_CATALOGUE_REVALIDATE } from "../src/lib/util/catalogue-cache.ts"

test("catalogue data is kept a minute unless the environment says otherwise", () => {
  assert.equal(DEFAULT_CATALOGUE_REVALIDATE, 60)
  assert.equal(catalogueRevalidate({}), 60)
  assert.equal(catalogueRevalidate({ CATALOGUE_REVALIDATE_SECONDS: "1" }), 1)
  assert.equal(catalogueRevalidate({ CATALOGUE_REVALIDATE_SECONDS: "300" }), 300)
})

test("a missing, zero or invalid override keeps the default; never cached forever", () => {
  for (const value of ["", "0", "-5", "abc", undefined]) {
    assert.equal(catalogueRevalidate({ CATALOGUE_REVALIDATE_SECONDS: value }), 60, String(value))
  }
})
