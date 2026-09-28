/**
 * Sanity Portable Text → Markdown for the bbclinic.cz magazine export.
 *
 * The source uses paragraphs with bold, italic, links and line breaks only.
 * Anything else (headings, lists, embedded objects) throws, so a later export
 * cannot silently drop content.
 */

export type Span = { _type: "span"; text: string; marks?: string[] }
export type MarkDef = { _key: string; _type: string; href?: string }
export type Block = {
  _type: string
  style?: string
  listItem?: string
  children?: Span[]
  markDefs?: MarkDef[]
}

type Run = { text: string; strong: boolean; em: boolean; href?: string }

const escapeInline = (text: string) => text.replace(/[\\`*_[\]<>]/g, "\\$&")

// Markdown reads these at the start of a line as headings, quotes, lists.
const escapeLineStart = (line: string) =>
  line.replace(/^(#{1,6}|>|[-+*]|\d+(?=[.)]))(?=[\s.)]|$)/, (m) =>
    /^\d/.test(m) ? `${m}\\` : `\\${m}`
  )

function runs(block: Block): Run[] {
  const defs = new Map((block.markDefs ?? []).map((d) => [d._key, d]))
  const result: Run[] = []

  for (const span of block.children ?? []) {
    if (span._type !== "span") {
      throw new Error(`Unsupported inline object "${span._type}"`)
    }
    const marks = span.marks ?? []
    const run: Run = {
      text: span.text,
      strong: marks.includes("strong"),
      em: marks.includes("em"),
      // A link mark whose definition lacks an href renders as plain text.
      href: marks
        .map((m) => defs.get(m))
        .find((d) => d?._type === "link" && d.href)?.href,
    }
    const last = result.at(-1)
    // Sanity splits spans freely; merge equal neighbours so markers do not stutter.
    if (last && last.strong === run.strong && last.em === run.em && last.href === run.href) {
      last.text += run.text
    } else {
      result.push(run)
    }
  }
  return result
}

/** One line of a run: markers hug the text, surrounding spaces stay outside. */
function renderSegment(segment: string, { strong, em, href }: Run): string {
  const [, lead, core, trail] = segment.match(/^(\s*)([\s\S]*?)(\s*)$/) as RegExpMatchArray
  if (!core) return segment
  let out = escapeInline(core)
  if (em) out = `*${out}*`
  if (strong) out = `**${out}**`
  if (href) out = `[${out}](<${href.replace(/[<>\s]/g, encodeURIComponent)}>)`
  return lead + out + trail
}

function blockToMarkdown(block: Block): string {
  if (block._type !== "block" || block.listItem) {
    throw new Error(`Unsupported block "${block._type}${block.listItem ? `/${block.listItem}` : ""}"`)
  }
  if (block.style && block.style !== "normal") {
    throw new Error(`Unsupported block style "${block.style}"`)
  }

  // Render per line so emphasis never spans a line break.
  const text = runs(block)
    .map((run) => run.text.split("\n").map((s) => renderSegment(s, run)).join("\n"))
    .join("")

  return text
    .split(/\n{2,}/)
    .map((paragraph) =>
      paragraph
        .split("\n")
        .map((line) => escapeLineStart(line.trim()))
        .filter(Boolean)
        .join("\\\n")
    )
    .filter(Boolean)
    .join("\n\n")
}

export function portableTextToMarkdown(blocks: Block[] | null | undefined): string {
  return (blocks ?? []).map(blockToMarkdown).filter(Boolean).join("\n\n")
}

/** Plain text with one paragraph per block, for text-format collections. */
export function portableTextToParagraphs(blocks: Block[] | null | undefined): string {
  return (blocks ?? [])
    .map((b) => (b.children ?? []).map((s) => s.text).join("").trim())
    .filter(Boolean)
    .join("\n\n")
}

/** A plain string that Markdown must show literally. */
export function escapeMarkdown(text: string): string {
  return text
    .split("\n")
    .map((line) => escapeLineStart(escapeInline(line.trim())))
    .join("\n")
}

export function portableTextToPlain(blocks: Block[] | null | undefined): string {
  return (blocks ?? [])
    .map((b) => (b.children ?? []).map((s) => s.text).join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
}
