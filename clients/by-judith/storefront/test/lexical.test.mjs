import assert from "node:assert/strict"
import test from "node:test"
import { createElement, Fragment } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { lexicalHasContent, lexicalToPlainText, renderLexical } from "../src/lib/cms/lexical.ts"

const markup = (state) =>
  renderToStaticMarkup(createElement(Fragment, null, renderLexical(state)))

test("renders the Payload example exactly", () => {
  const state = {
    root: {
      type: "root",
      version: 1,
      children: [
        {
          type: "heading",
          tag: "h1",
          children: [{ type: "text", text: "Nadpis", format: 0 }],
        },
        {
          type: "paragraph",
          children: [
            { type: "text", text: "Tučně", format: 1 },
            { type: "text", text: " a ", format: 0 },
            {
              type: "link",
              fields: { url: "https://example.cz", newTab: true },
              children: [{ type: "text", text: "odkaz", format: 0 }],
            },
          ],
        },
        {
          type: "list",
          listType: "bullet",
          tag: "ul",
          children: [
            { type: "listitem", children: [{ type: "text", text: "A", format: 0 }] },
          ],
        },
      ],
    },
  }
  assert.equal(
    markup(state),
    '<h2>Nadpis</h2><p><strong>Tučně</strong> a <a href="https://example.cz" target="_blank" rel="noopener noreferrer">odkaz</a></p><ul><li>A</li></ul>',
  )
})

test("h1 is downgraded to h2, h3 stays h3", () => {
  const state = {
    root: {
      type: "root",
      children: [
        { type: "heading", tag: "h1", children: [{ type: "text", text: "Vůně", format: 0 }] },
        { type: "heading", tag: "h3", children: [{ type: "text", text: "Podnadpis", format: 0 }] },
      ],
    },
  }
  assert.equal(markup(state), "<h2>Vůně</h2><h3>Podnadpis</h3>")
})

test("number list renders ol and a nested list inside li", () => {
  const state = {
    root: {
      type: "root",
      children: [
        {
          type: "list",
          listType: "number",
          tag: "ol",
          children: [
            {
              type: "listitem",
              children: [
                { type: "text", text: "První", format: 0 },
                {
                  type: "list",
                  listType: "bullet",
                  tag: "ul",
                  children: [
                    { type: "listitem", children: [{ type: "text", text: "Vnořená", format: 0 }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  }
  assert.equal(
    markup(state),
    "<ol><li>První<ul><li>Vnořená</li></ul></li></ol>",
  )
})

test("format 3 nests bold outside italic", () => {
  const state = {
    root: {
      type: "root",
      children: [
        { type: "paragraph", children: [{ type: "text", text: "x", format: 3 }] },
      ],
    },
  }
  assert.equal(markup(state), "<p><strong><em>x</em></strong></p>")
})

test("a javascript: URL loses the anchor but keeps the text", () => {
  const state = {
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "link",
              fields: { url: "javascript:alert(1)" },
              children: [{ type: "text", text: "Podvod", format: 0 }],
            },
          ],
        },
      ],
    },
  }
  assert.equal(markup(state), "<p>Podvod</p>")
})

test("text is escaped, not injected as HTML", () => {
  const state = {
    root: {
      type: "root",
      children: [
        { type: "paragraph", children: [{ type: "text", text: "<script>", format: 0 }] },
      ],
    },
  }
  // Ampersand built from its code point so this source file itself never
  // contains an HTML-escaped script tag.
  const amp = String.fromCharCode(38)
  assert.equal(markup(state), `<p>${amp}lt;script${amp}gt;</p>`)
})

test("an empty paragraph renders nothing", () => {
  const state = {
    root: {
      type: "root",
      children: [
        { type: "paragraph", children: [] },
        { type: "paragraph", children: [{ type: "text", text: "Plný", format: 0 }] },
      ],
    },
  }
  assert.equal(markup(state), "<p>Plný</p>")
})

test("null and undefined states render as empty markup", () => {
  assert.equal(markup(null), "")
  assert.equal(markup(undefined), "")
  assert.equal(markup({}), "")
  assert.equal(markup({ root: { type: "root" } }), "")
})

test("an unknown node renders its children, and quote/hr/linebreak work", () => {
  const state = {
    root: {
      type: "root",
      children: [
        {
          type: "mystery",
          children: [{ type: "text", text: "Mimochodem", format: 0 }],
        },
        {
          type: "quote",
          children: [{ type: "text", text: "Citace", format: 0 }],
        },
        { type: "paragraph", children: [{ type: "text", text: "Řádek", format: 0 }] },
        { type: "linebreak" },
        { type: "horizontalrule" },
      ],
    },
  }
  assert.equal(
    markup(state),
    "Mimochodem<blockquote>Citace</blockquote><p>Řádek</p><br/><hr/>",
  )
})

test("autolink renders an anchor and tel:/mailto:/relative URLs are allowed", () => {
  const state = {
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "autolink",
              fields: { url: "tel:+420123456789" },
              children: [{ type: "text", text: "Zavolejte", format: 0 }],
            },
          ],
        },
      ],
    },
  }
  assert.equal(markup(state), '<p><a href="tel:+420123456789">Zavolejte</a></p>')
})

test("protocol-relative links lose their anchor", () => {
  const state = { root: { type: "root", children: [{ type: "paragraph", children: [
    { type: "link", fields: { url: "//evil.example" }, children: [{ type: "text", text: "a", format: 0 }] },
    { type: "link", fields: { url: "/\\evil.example" }, children: [{ type: "text", text: "b", format: 0 }] },
    { type: "link", fields: { url: "/store" }, children: [{ type: "text", text: "c", format: 0 }] },
  ] }] } }
  assert.equal(renderToStaticMarkup(createElement(Fragment, null, renderLexical(state))), '<p>ab<a href="/store">c</a></p>')
})

test("plain text joins blocks and line breaks with spaces and keeps link text", () => {
  const text = (value, format = 0) => ({ type: "text", text: value, format })
  const state = {
    root: {
      type: "root",
      children: [
        { type: "paragraph", children: [text("Jak jste se k nám dostala?", 1), { type: "linebreak" }, text("A proč?", 1)] },
        {
          type: "paragraph",
          children: [text("Díky "), { type: "link", fields: { url: "https://example.cz" }, children: [text("doporučení")] }, text(".")],
        },
        { type: "list", children: [{ type: "listitem", children: [text("Jedna")] }, { type: "listitem", children: [text("dvě")] }] },
      ],
    },
  }
  assert.equal(lexicalToPlainText(state), "Jak jste se k nám dostala? A proč? Díky doporučení. Jedna dvě")
  assert.equal(lexicalToPlainText(null), "")
})

const upload = (value, relationTo = "media") => ({ type: "upload", relationTo, value, format: "", version: 3 })
const doc = (...children) => ({ root: { type: "root", children } })
const photo = { id: 7, url: "/api/media/file/foto.webp", alt: "Balení № 1 Allergy", width: 1200, height: 800 }

test("images inserted in the CMS render with their alt text and size", () => {
  assert.equal(
    markup(doc(upload(photo))),
    '<img src="/api/media/file/foto.webp" alt="Balení № 1 Allergy" width="1200" height="800" loading="lazy" decoding="async"/>'
  )
  const custom = renderToStaticMarkup(createElement(Fragment, null, renderLexical(doc(upload(photo)), {
    image: (media, key) => createElement("figure", { key }, media.alt),
  })))
  assert.equal(custom, "<figure>Balení № 1 Allergy</figure>")
  // A custom renderer may decline (e.g. no dimensions): the plain <img> applies.
  const declined = renderToStaticMarkup(createElement(Fragment, null, renderLexical(doc(upload({ url: "/a.svg", alt: "" })), { image: () => undefined })))
  assert.equal(declined, '<img src="/a.svg" alt="" loading="lazy" decoding="async"/>')
})

test("unpopulated, foreign or unsafe images render nothing", () => {
  assert.equal(markup(doc(upload(7))), "")
  assert.equal(markup(doc(upload(photo, "users"))), "")
  assert.equal(markup(doc(upload({ ...photo, url: "javascript:alert(1)" }))), "")
  assert.equal(markup(doc(upload({ ...photo, url: "//evil.example/x.webp" }))), "")
})

test("an image alone counts as content; text-free states do not", () => {
  assert.equal(lexicalHasContent(doc(upload(photo))), true)
  assert.equal(lexicalHasContent(doc(upload(7))), false)
  assert.equal(lexicalHasContent(doc({ type: "paragraph", children: [] })), false)
  assert.equal(lexicalHasContent(doc({ type: "paragraph", children: [{ type: "text", text: "Text", format: 0 }] })), true)
  assert.equal(lexicalHasContent(null), false)
})
