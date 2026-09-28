import assert from "node:assert/strict"
import test from "node:test"

import {
  escapeMarkdown,
  portableTextToMarkdown,
  portableTextToParagraphs,
  portableTextToPlain,
  type Block,
} from "./portable-text.ts"
import { slugify } from "../content/sanity.ts"

const block = (children: Block["children"], markDefs: Block["markDefs"] = []): Block => ({
  _type: "block",
  style: "normal",
  children,
  markDefs,
})
const span = (text: string, marks: string[] = []) => ({ _type: "span" as const, text, marks })

test("paragraphs are separated by a blank line", () => {
  assert.equal(
    portableTextToMarkdown([block([span("První.")]), block([span("Druhý.")])]),
    "První.\n\nDruhý."
  )
})

test("bold and italic hug the text; spaces stay outside the markers", () => {
  assert.equal(
    portableTextToMarkdown([block([span("Otázka: ", ["strong"]), span("odpověď "), span("důraz", ["em"])])]),
    "**Otázka:** odpověď *důraz*"
  )
})

test("split spans with the same marks merge into one marker pair", () => {
  assert.equal(
    portableTextToMarkdown([block([span("Jak ", ["strong"]), span("začít?", ["strong"])])]),
    "**Jak začít?**"
  )
})

test("a line break inside a paragraph is a hard break, never inside emphasis", () => {
  assert.equal(
    portableTextToMarkdown([block([span("Řádek jedna\nřádek dva", ["strong"]), span("\nkonec")])]),
    "**Řádek jedna**\\\n**řádek dva**\\\nkonec"
  )
  assert.equal(portableTextToMarkdown([block([span("A\n\nB")])]), "A\n\nB")
})

test("text that looks like Markdown stays literal", () => {
  assert.equal(
    portableTextToMarkdown([block([span("# 1. místo *hvězdička* [x] _a_\n- odrážka\n2. bod")])]),
    "\\# 1. místo \\*hvězdička\\* \\[x\\] \\_a\\_\\\n\\- odrážka\\\n2\\. bod"
  )
})

test("links use their definition; a definition without href is plain text", () => {
  const defs = [
    { _key: "a", _type: "link", href: "https://maps.app.goo.gl/x" },
    { _key: "b", _type: "link" },
  ]
  assert.equal(
    portableTextToMarkdown([block([span("IKEM", ["b", "a"]), span(" a "), span("jinde", ["b"])], defs)]),
    "[IKEM](<https://maps.app.goo.gl/x>) a jinde"
  )
})

test("unsupported structures fail loudly instead of losing content", () => {
  assert.throws(() => portableTextToMarkdown([{ _type: "image" }]), /Unsupported block "image"/)
  assert.throws(
    () => portableTextToMarkdown([{ ...block([span("x")]), style: "h2" }]),
    /Unsupported block style "h2"/
  )
})

test("paragraph text keeps one paragraph per block, without marks", () => {
  assert.equal(
    portableTextToParagraphs([block([span("První ", ["strong"]), span("věta.")]), block([span(" ")]), block([span("Druhá.")])]),
    "První věta.\n\nDruhá."
  )
})

test("plain strings are escaped for Markdown", () => {
  assert.equal(escapeMarkdown("PMS, *bolestivá* menstruace"), "PMS, \\*bolestivá\\* menstruace")
  assert.equal(escapeMarkdown("1. fáze"), "1\\. fáze")
})

test("slugs drop diacritics and titles' punctuation", () => {
  assert.equal(slugify("MUDr. Hana Šulcová"), "mudr-hana-sulcova")
  assert.equal(slugify("Akupunktura, Aurikuloterapie"), "akupunktura-aurikuloterapie")
  assert.equal(slugify("Je akupunktura či fytoterapie vhodná pro děti?"), "je-akupunktura-ci-fytoterapie-vhodna-pro-deti")
  assert.throws(() => slugify("—"), /Cannot make a slug/)
})

test("plain text flattens blocks and line breaks for excerpts", () => {
  assert.equal(
    portableTextToPlain([block([span("Úvod\n", ["strong"]), span("text.")]), block([span(" Další ")])]),
    "Úvod text. Další"
  )
})
