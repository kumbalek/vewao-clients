import assert from "node:assert/strict"
import test from "node:test"

import { decodeEntities, htmlToLexical, type LexicalNode } from "./html-lexical.ts"

const ids = () => {
  let n = 0
  return () => `id${++n}`
}
const convert = (html: string) => htmlToLexical(html, { newId: ids(), dropLinksTo: ["shop.bbclinic.cz"] })
const children = (html: string) => convert(html)?.root.children as LexicalNode[]
const texts = (node: LexicalNode): string =>
  node.type === "text" ? String(node.text) : ((node.children as LexicalNode[] | undefined) ?? []).map(texts).join("")

test("entities decode, unknown ones stay", () => {
  assert.equal(decodeEntities("A &amp; B&nbsp;&#8482;&#x2122; &bogus;"), "A & B ™™ &bogus;")
})

test("the old shop's description structure maps onto headings and paragraphs", () => {
  const nodes = children(`<span class="text-start"></span>
    <h5><strong><span style="color: #d1b675;">Inovativní koktejl chrání vaši pleť.</span></strong></h5>
    <hr />
    <h6><span style="color: #d1b675;"><strong>Made in USA</strong></span></h6>
    <h2><span></span></h2>
    <h2><span>AKTIVNÍ LÁTKY</span></h2>
    <h4><strong>Vitamín C (MAP)</strong></h4>
    <p>Stabilní forma <strong>vitamínu</strong> C.</p>
    <h2><span>POUŽITÍ</span></h2>
    <ul><li>Ráno a večer</li><li><p>1–2 dávky</p></li></ul>`)
  assert.deepEqual(
    nodes.map((n) => [n.type, n.listType ?? n.tag ?? "", texts(n)]),
    [
      ["paragraph", "", "Inovativní koktejl chrání vaši pleť."],
      ["horizontalrule", "", ""],
      ["paragraph", "", "Made in USA"],
      ["heading", "h2", "AKTIVNÍ LÁTKY"],
      ["heading", "h3", "Vitamín C (MAP)"],
      ["paragraph", "", "Stabilní forma vitamínu C."],
      ["heading", "h2", "POUŽITÍ"],
      ["list", "bullet", "Ráno a večer1–2 dávky"],
    ]
  )
  // Notes stay bold; headings do not repeat the shop's bold.
  assert.equal((nodes[0]!.children as LexicalNode[])[0]!.format, 1)
  assert.equal((nodes[4]!.children as LexicalNode[])[0]!.format, 0)
  const paragraph = nodes[5]!.children as LexicalNode[]
  assert.deepEqual(paragraph.map((t) => [t.text, t.format]), [["Stabilní forma ", 0], ["vitamínu", 1], [" C.", 0]])
})

test("links to the old shop keep their text; others stay links", () => {
  const nodes = children(
    `<p>Viz <a href="https://shop.bbclinic.cz/p/r-e-r-eye-serum">R.E.R Eye Serum</a> a <a href="https://www.dpderm.com/">DP</a>.</p>`
  )
  const inline = nodes[0]!.children as LexicalNode[]
  assert.deepEqual(inline.map((n) => n.type), ["text", "link", "text"])
  assert.equal(inline[0]!.text, "Viz R.E.R Eye Serum a ")
  assert.deepEqual(inline[1]!.fields, { linkType: "custom", url: "https://www.dpderm.com/", newTab: true })
})

test("line breaks, ordered lists and stray text are kept", () => {
  const nodes = children(`Úvodní text<br>druhý řádek<ol><li>jedna</li><li>dvě</li></ol><div><p>V divu</p></div>`)
  assert.deepEqual(nodes.map((n) => n.type), ["paragraph", "list", "paragraph"])
  assert.deepEqual((nodes[0]!.children as LexicalNode[]).map((n) => n.type), ["text", "linebreak", "text"])
  assert.equal(nodes[1]!.listType, "number")
})

test("nothing visible gives no document", () => {
  assert.equal(convert(`<span class="text-start"></span><h2><span></span></h2><hr/><p> </p>`), null)
})
