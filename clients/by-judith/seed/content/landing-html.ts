import { escapeMarkdown } from "../magazin/portable-text.ts"

/**
 * Markdown from a bbclinic.cz landing page whose content is hard-coded in its
 * Gatsby template rather than stored in Sanity (the Ultherapy page). Handles
 * the markup that page uses: headings, paragraphs, two-span list items,
 * year/text timeline rows and images. Images become Markdown images with
 * absolute URLs, for the import to upload. Links and anything else are dropped.
 */

export type LandingImage = { url: string; alt: string | null }

const decode = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()

const TOKEN = new RegExp(
  [
    /<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/.source, // 1, 2: heading level, text
    /<p\b[^>]*>([\s\S]*?)<\/p>/.source, // 3: paragraph
    /<li\b[^>]*>\s*<span\b[^>]*>([\s\S]*?)<\/span>\s*<span\b[^>]*>([\s\S]*?)<\/span>\s*<\/li>/.source, // 4, 5
    /<div>\s*<div>([^<]+)<\/div>\s*<div>([^<]+)<\/div>\s*<\/div>/.source, // 6, 7: timeline row
    /<img\b([^>]*)>/.source, // 8: image attributes
  ].join("|"),
  "g"
)

export function landingHtmlToMarkdown(html: string, siteUrl: string): { markdown: string; images: LandingImage[] } {
  const content = html
    .replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/g, "")
    // Attributes other than src/alt only get in the way of the patterns above.
    .replace(/\s(?:class|style|data-[\w-]+|loading|decoding|width|height|sizes|srcset)="[^"]*"/g, "")

  const blocks: string[] = []
  const images: LandingImage[] = []
  let list: string[] = []
  const flushList = () => {
    if (list.length) blocks.push(list.join("\n"))
    list = []
  }

  for (const m of content.matchAll(TOKEN)) {
    if (m[1]) {
      flushList()
      blocks.push(`${"#".repeat(Number(m[1]))} ${escapeMarkdown(decode(m[2]))}`)
    } else if (m[3] !== undefined) {
      flushList()
      const text = decode(m[3])
      if (text) blocks.push(escapeMarkdown(text))
    } else if (m[4] !== undefined || m[6] !== undefined) {
      const [title, text] = m[4] !== undefined ? [m[4], m[5]] : [m[6], m[7]]
      list.push(`- **${escapeMarkdown(decode(title))}**: ${escapeMarkdown(decode(text))}`)
    } else if (m[8] !== undefined) {
      const src = m[8].match(/\ssrc="([^"]+)"/)?.[1]
      if (!src || src.startsWith("data:")) continue
      const url = new URL(src, siteUrl).toString()
      if (images.some((image) => image.url === url)) continue // Gatsby repeats images
      const alt = m[8].match(/\salt="([^"]*)"/)?.[1] ?? null
      images.push({ url, alt: alt && decode(alt) })
      flushList()
      blocks.push(`![${escapeMarkdown(decode(alt ?? ""))}](${url})`)
    }
  }
  flushList()

  return { markdown: blocks.join("\n\n"), images }
}
