import assert from "node:assert/strict"
import test from "node:test"
import { signPreview, verifyPreview } from "../src/lib/cms/preview-token.ts"

const SECRET = "test-secret"
const now = Date.UTC(2026, 9, 16, 12, 0, 0)
const exp = now / 1000 + 600
const grant = (over = {}) => ({ path: "/cz/cms/o-nas", expires: exp, mode: "view", signature: signPreview(SECRET, "/cz/cms/o-nas", exp, "view"), ...over })

test("a valid grant for one path is accepted", () => {
  assert.deepEqual(verifyPreview(SECRET, grant(), now), { path: "/cz/cms/o-nas", expires: exp, mode: "view", signature: grant().signature })
})

test("expired, tampered or unsigned grants are rejected", () => {
  assert.equal(verifyPreview(SECRET, grant(), (exp + 1) * 1000), null)
  assert.equal(verifyPreview(SECRET, grant({ path: "/cz/cms/jina" }), now), null)
  assert.equal(verifyPreview(SECRET, grant({ mode: "edit" }), now), null)
  assert.equal(verifyPreview("other-secret", grant(), now), null)
  assert.equal(verifyPreview(undefined, grant(), now), null)
  assert.equal(verifyPreview(SECRET, grant({ signature: "x" }), now), null)
})

test("only same-site paths are accepted", () => {
  for (const path of ["//evil.example/x", "https://evil.example", "/\\evil.example", "cz/cms/o-nas"]) {
    assert.equal(verifyPreview(SECRET, { ...grant(), path, signature: signPreview(SECRET, path, exp, "view") }, now), null)
  }
})
