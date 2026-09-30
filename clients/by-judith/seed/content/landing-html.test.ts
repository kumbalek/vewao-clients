import assert from "node:assert/strict"
import test from "node:test"

import { landingHtmlToMarkdown } from "./landing-html.ts"

const SITE = "https://www.bbclinic.cz"

test("headings, paragraphs, span lists and timelines become Markdown", () => {
  const html = `
    <h2 class="x">Proč zvolit právě Ultherapy® Prime?</h2>
    <p class="y">Ošetření &quot;bez skalpelu&quot;&nbsp;– rychle.</p>
    <ul><li><span>Hloubka</span><span>Až 4,5 mm.</span></li><li><span>Komfort</span><span>Bez omezení.</span></li></ul>
    <h2>Historie</h2>
    <div><div><div>2009 – Revoluční rok</div><div>Certifikace FDA.</div></div></div>
    <script>ignored()</script>`
  assert.equal(
    landingHtmlToMarkdown(html, SITE).markdown,
    [
      "## Proč zvolit právě Ultherapy® Prime?",
      'Ošetření "bez skalpelu" – rychle.',
      "- **Hloubka**: Až 4,5 mm.\n- **Komfort**: Bez omezení.",
      "## Historie",
      "- **2009 – Revoluční rok**: Certifikace FDA.",
    ].join("\n\n")
  )
})

test("images are absolute, listed once, and placeholders are skipped", () => {
  const html = `
    <h2>Oblasti</h2>
    <img alt="" src="data:image/svg+xml;base64,AAA">
    <picture><img alt="Oblasti ošetření" src="/static/ultherapy_2-abc.jpg" loading="lazy"></picture>
    <noscript><img alt="Oblasti ošetření" src="/static/ultherapy_2-abc.jpg"></noscript>
    <img alt="Oblasti ošetření" src="/static/ultherapy_2-abc.jpg">`
  const { markdown, images } = landingHtmlToMarkdown(html, SITE)
  assert.deepEqual(images, [{ url: `${SITE}/static/ultherapy_2-abc.jpg`, alt: "Oblasti ošetření" }])
  assert.equal(markdown, `## Oblasti\n\n![Oblasti ošetření](${SITE}/static/ultherapy_2-abc.jpg)`)
})
