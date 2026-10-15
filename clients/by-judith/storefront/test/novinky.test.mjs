import assert from "node:assert/strict"
import test from "node:test"
import { activeNews, newsLink, pragueDate } from "../src/lib/util/novinky.ts"

test("pragueDate crosses DST and midnight correctly", () => {
  // Summer: 22:30 UTC is already 15 Oct in Prague (CEST, UTC+2).
  assert.equal(pragueDate(new Date("2026-10-14T22:30:00Z")), "2026-10-15")
  // Winter: 23:30 UTC is 15 Oct in Prague (CET, UTC+1).
  assert.equal(pragueDate(new Date("2026-01-14T23:30:00Z")), "2026-01-15")
  // Winter: 22:30 UTC is still 14 Oct in Prague.
  assert.equal(pragueDate(new Date("2026-01-14T22:30:00Z")), "2026-01-14")
})

test("activeNews keeps offers valid through the whole platnost_do day", () => {
  // 21:00 UTC on 15 Oct is 23:00 in Prague — still 15 Oct.
  const now = new Date("2026-10-15T21:00:00Z")
  const items = [
    { slug: "ends-today", title: "Ends today", created_at: "2026-10-01T10:00:00Z", metadata: { platnost_do: "2026-10-15" } },
    { slug: "ended", title: "Ended", created_at: "2026-10-01T10:00:00Z", metadata: { platnost_do: "2026-10-14" } },
    { slug: "no-expiry", title: "No expiry", created_at: "2026-10-01T10:00:00Z", metadata: null },
    { slug: "bad-format", title: "Bad format", created_at: "2026-10-01T10:00:00Z", metadata: { platnost_do: "15.10.2026" } },
    { slug: "future", title: "Future", created_at: "2026-10-01T10:00:00Z", metadata: { platnost_do: "2026-10-20" } },
  ]
  const kept = activeNews(items, now).map((item) => item.slug)
  // All kept items share one created_at, so ties come out slug-ascending.
  assert.deepEqual(kept, ["bad-format", "ends-today", "future", "no-expiry"])
})

test("activeNews pins items first by poradi, then sorts the rest newest first", () => {
  const now = new Date("2026-10-15T21:00:00Z")
  const items = [
    { slug: "old-unpinned", title: "Old", created_at: "2026-09-01T10:00:00Z" },
    { slug: "pin-two", title: "Pin two", created_at: "2026-09-20T10:00:00Z", metadata: { poradi: 2 } },
    { slug: "newest-unpinned", title: "Newest", created_at: "2026-10-10T10:00:00Z" },
    { slug: "pin-one", title: "Pin one", created_at: "2026-09-30T10:00:00Z", metadata: { poradi: 1 } },
    {
      slug: "published-over-created",
      title: "Published",
      created_at: "2026-09-01T10:00:00Z",
      published_at: "2026-10-14T10:00:00Z",
    },
    { slug: "pin-one-older-tie", title: "Tie", created_at: "2026-09-05T10:00:00Z", metadata: { poradi: 1 } },
  ]
  const order = activeNews(items, now).map((item) => item.slug)
  assert.deepEqual(order, [
    // Pinned first, poradi 1 before 2; the poradi-1 tie goes by slug ascending.
    "pin-one",
    "pin-one-older-tie",
    "pin-two",
    // Unpinned: published_at (14 Oct) beats created_at (10 Oct); then created desc.
    "published-over-created",
    "newest-unpinned",
    "old-unpinned",
  ])
})

test("activeNews does not mutate the input array", () => {
  const now = new Date("2026-10-15T21:00:00Z")
  const items = [
    { slug: "a", title: "A", created_at: "2026-09-01T10:00:00Z", metadata: { poradi: 2 } },
    { slug: "b", title: "B", created_at: "2026-10-01T10:00:00Z" },
    { slug: "c", title: "C", created_at: "2026-09-15T10:00:00Z", metadata: { poradi: 1 } },
  ]
  const before = items.map((item) => item.slug)
  activeNews(items, now)
  assert.deepEqual(items.map((item) => item.slug), before)
})

test("newsLink classifies internal paths, external URLs and rejects the rest", () => {
  const link = (odkaz) => newsLink({ slug: "s", title: "T", created_at: "2026-10-01T10:00:00Z", metadata: { odkaz } })
  assert.deepEqual(link("/procedury/x"), { href: "/procedury/x", external: false })
  assert.deepEqual(link(" https://example.com/a "), { href: "https://example.com/a", external: true })
  assert.deepEqual(link("http://x.cz"), { href: "http://x.cz", external: true })
  assert.equal(link("javascript:alert(1)"), null)
  assert.equal(link("//evil.com"), null)
  assert.equal(link("procedury/x"), null)
  assert.equal(link(""), null)
  assert.equal(link(null), null)
  assert.equal(newsLink({ slug: "s", title: "T", created_at: "2026-10-01T10:00:00Z" }), null)
})

test("a backslash after the slash is not an internal path", () => {
  assert.equal(newsLink({ slug: "x", title: "x", created_at: "2026-10-01T00:00:00Z", metadata: { odkaz: "/\\evil.com" } }), null)
})
