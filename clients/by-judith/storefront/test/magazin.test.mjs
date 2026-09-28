import assert from "node:assert/strict"
import test from "node:test"
import {
  MAGAZIN_PAGE_SIZE,
  articleTags,
  relatedArticles,
  selectArticles,
  tagLabel,
} from "../src/lib/util/magazin.ts"

const article = (slug, ...tags) => ({ slug, tags: tags.map((value) => ({ value })) })
const many = (n) => Array.from({ length: n }, (_, i) => article(`a${i}`))

test("the newest article is featured once and not repeated in the grid", () => {
  const result = selectArticles(many(5), {})
  assert.equal(result.featured.slug, "a0")
  assert.deepEqual(result.items.map((a) => a.slug), ["a1", "a2", "a3", "a4"])
})

test("paging continues after the featured article without overlap", () => {
  const articles = many(1 + MAGAZIN_PAGE_SIZE + 2)
  const second = selectArticles(articles, { page: 2 })
  assert.equal(second.featured, null)
  assert.equal(second.pageCount, 2)
  assert.deepEqual(second.items.map((a) => a.slug), [`a${MAGAZIN_PAGE_SIZE + 1}`, `a${MAGAZIN_PAGE_SIZE + 2}`])
})

test("an out-of-range or malformed page falls back to a valid page", () => {
  assert.equal(selectArticles(many(3), { page: 99 }).page, 1)
  assert.equal(selectArticles(many(3), { page: Number("abc") }).page, 1)
})

test("a tag filter lists only tagged articles and features none", () => {
  const articles = [article("a", "akupunktura"), article("b"), article("c", "fytoterapie", "akupunktura")]
  const result = selectArticles(articles, { tag: "akupunktura" })
  assert.equal(result.featured, null)
  assert.deepEqual(result.items.map((a) => a.slug), ["a", "c"])
  assert.equal(result.total, 2)
})

test("tags are listed once, in the order the articles use them", () => {
  const articles = [article("a", "akupunktura"), article("b", "fytoterapie", "akupunktura")]
  assert.deepEqual(articleTags(articles), ["akupunktura", "fytoterapie"])
})

test("related articles prefer a shared tag, then fill with the newest", () => {
  const current = article("x", "mezoterapie")
  const articles = [article("a"), current, article("b", "mezoterapie"), article("c"), article("d")]
  assert.deepEqual(relatedArticles(articles, current).map((a) => a.slug), ["b", "a", "c"])
})

test("tag labels are sentence case, keeping Czech letters", () => {
  assert.equal(tagLabel("atopický ekzém"), "Atopický ekzém")
  assert.equal(tagLabel("čínská medicína"), "Čínská medicína")
})
