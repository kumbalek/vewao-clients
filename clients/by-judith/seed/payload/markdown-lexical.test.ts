import assert from "node:assert/strict"
import test from "node:test"

import { markdownToLexical } from "./markdown-lexical.ts"

type Node = { type: string; text?: string; format?: number; fields?: Record<string, unknown>; children?: Node[]; id?: string }

const paragraphs = (markdown: string) =>
  (markdownToLexical(markdown, () => "id").root.children as Node[]).map((p) => p.children ?? [])
const texts = (nodes: Node[]) => nodes.map((n) => (n.type === "text" ? [n.text, n.format] : [n.type]))

test("blank lines separate paragraphs; a single newline is a space", () => {
  const result = paragraphs("První\nřádek\n\n\nDruhý")
  assert.equal(result.length, 2)
  assert.deepEqual(texts(result[0]), [["První řádek", 0]])
  assert.deepEqual(texts(result[1]), [["Druhý", 0]])
})

test("backslash-newline is a hard line break", () => {
  assert.deepEqual(texts(paragraphs("Ano\\\nNe")[0]), [["Ano", 0], ["linebreak"], ["Ne", 0]])
})

test("bold, italic and both set the Lexical format bits", () => {
  assert.deepEqual(texts(paragraphs("**Otázka?** odpověď *kurzíva* ***obojí***")[0]), [
    ["Otázka?", 1],
    [" odpověď ", 0],
    ["kurzíva", 2],
    [" ", 0],
    ["obojí", 3],
  ])
})

test("an unpaired or escaped asterisk stays literal", () => {
  assert.deepEqual(texts(paragraphs("5 * 3 a \\*hvězdička\\*")[0]), [["5 * 3 a *hvězdička*", 0]])
})

test("an external link opens in a new tab and keeps its formatting", () => {
  const [link] = paragraphs("[**Registr**](<https://example.cz/a b>)")[0]
  assert.equal(link.type, "link")
  assert.equal(link.id, "id")
  assert.deepEqual(link.fields, { linkType: "custom", url: "https://example.cz/a b", newTab: true })
  assert.deepEqual(texts(link.children ?? []), [["Registr", 1]])
})

test("a site-relative link stays in the tab", () => {
  const [link] = paragraphs("[ceník](/cenik)")[0]
  assert.deepEqual(link.fields, { linkType: "custom", url: "/cenik", newTab: false })
})

test("a bare www. address becomes an autolink without trailing punctuation", () => {
  const [before, link, after] = paragraphs("Viz www.by-judith.com.")[0]
  assert.deepEqual(texts([before]), [["Viz ", 0]])
  assert.equal(link.type, "autolink")
  assert.deepEqual(link.fields, { linkType: "custom", url: "http://www.by-judith.com", newTab: true })
  assert.deepEqual(texts(link.children ?? []), [["www.by-judith.com", 0]])
  assert.deepEqual(texts([after]), [[".", 0]])
})

test("an address inside a word is not linked", () => {
  assert.deepEqual(texts(paragraphs("e-mailwww.x.cz")[0]), [["e-mailwww.x.cz", 0]])
})
