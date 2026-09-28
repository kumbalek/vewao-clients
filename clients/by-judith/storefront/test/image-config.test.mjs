import assert from "node:assert/strict"
import { createRequire } from "node:module"
import test from "node:test"

const require = createRequire(import.meta.url)
const { matchRemotePattern } = require("next/dist/shared/lib/match-remote-pattern")

// Next reads a URL entry's path as the allowed path glob.
function remotePatterns() {
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ??= "pk_test_config"
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL = "https://api.example.test"
  const config = require("../next.config.js")
  return config.images.remotePatterns.map(({ protocol, hostname, port, pathname, search }) => ({
    protocol: protocol?.replace(/:$/, ""),
    hostname,
    port,
    pathname,
    search,
  }))
}

const allowed = (url) => remotePatterns().some((pattern) => matchRemotePattern(pattern, new URL(url)))

test("images uploaded to the Medusa backend can be optimised", () => {
  assert.equal(allowed("https://api.example.test/static/1790612377986-rozhovor.png"), true)
})

test("the optimiser does not fetch other backend paths", () => {
  assert.equal(allowed("https://api.example.test/admin/users"), false)
  assert.equal(allowed("https://elsewhere.example.test/static/x.png"), false)
})
