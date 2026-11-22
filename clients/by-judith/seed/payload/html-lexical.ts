import { randomBytes } from "node:crypto"

/**
 * Rich text from the clinic's old Upgates shop as Payload's Lexical JSON
 * (vewao-clients#64). Supported: h2 → heading h2; h1, h3, h4 → heading h3; h5,
 * h6 → a bold paragraph (the shop used them for emphasised notes); p; ul/ol with
 * li; hr; br; strong/b, em/i, u; a. Colours, classes and spans are dropped, so
 * is anything else structural (its text stays). Links to `dropLinksTo` hosts
 * keep their text only. Empty blocks are skipped.
 */

export type LexicalNode = { type: string; version: number; [key: string]: unknown }
export type LexicalState = { root: LexicalNode }

type Element = { tag: string; attrs: string; children: Node[] }
type Node = Element | string

const BOLD = 1
const ITALIC = 2
const UNDERLINE = 8
const VOID = new Set(["br", "hr", "img", "input", "meta", "link", "wbr"])
const INLINE = new Set(["strong", "b", "em", "i", "u", "span", "a", "br", "font", "small", "sup", "sub", "mark", "abbr"])
const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", hellip: "…",
  laquo: "«", raquo: "»", bdquo: "„", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", sbquo: "‚",
  deg: "°", times: "×", plusmn: "±", micro: "µ", reg: "®", trade: "™", copy: "©", euro: "€", middot: "·",
}

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) =>
    code[0] === "#"
      ? String.fromCodePoint(code[1]?.toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1)))
      : (ENTITIES[code.toLowerCase()] ?? entity)
  )
}

/** A forgiving parse into elements and text: unknown closing tags are ignored, unclosed ones end with their parent. */
function parse(html: string): Element {
  const root: Element = { tag: "root", attrs: "", children: [] }
  const stack: Element[] = [root]
  for (const match of html.matchAll(/<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>|[^<]+|</g)) {
    const [token, closing, rawTag, attrs] = match
    if (token.startsWith("<!--")) continue
    if (rawTag === undefined) {
      stack[stack.length - 1]!.children.push(token)
      continue
    }
    const tag = rawTag.toLowerCase()
    if (closing) {
      const index = stack.map((element) => element.tag).lastIndexOf(tag)
      if (index > 0) stack.length = index
      continue
    }
    const element: Element = { tag, attrs: attrs ?? "", children: [] }
    stack[stack.length - 1]!.children.push(element)
    if (!VOID.has(tag) && !attrs?.trimEnd().endsWith("/")) stack.push(element)
  }
  return root
}

const textNode = (text: string, format: number): LexicalNode => ({
  type: "text",
  version: 1,
  text,
  format,
  detail: 0,
  mode: "normal",
  style: "",
})

const element = (type: string, children: LexicalNode[], extra: Record<string, unknown> = {}): LexicalNode => ({
  type,
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  ...extra,
  children,
})

type Options = { newId: () => string; dropLinksTo: string[] }

function inline(nodes: Node[], format: number, options: Options): LexicalNode[] {
  const out: LexicalNode[] = []
  const push = (node: LexicalNode) => {
    const last = out[out.length - 1]
    if (node.type === "text" && last?.type === "text" && last.format === node.format) {
      last.text = `${last.text}${node.text}`
    } else out.push(node)
  }
  for (const node of nodes) {
    if (typeof node === "string") {
      const text = decodeEntities(node).replace(/\s+/g, " ")
      if (text) push(textNode(text, format))
      continue
    }
    const { tag } = node
    if (tag === "br") out.push({ type: "linebreak", version: 1 })
    else if (tag === "strong" || tag === "b") inline(node.children, format | BOLD, options).forEach(push)
    else if (tag === "em" || tag === "i") inline(node.children, format | ITALIC, options).forEach(push)
    else if (tag === "u") inline(node.children, format | UNDERLINE, options).forEach(push)
    else if (tag === "a") {
      const href = decodeEntities(/href="([^"]*)"/i.exec(node.attrs)?.[1] ?? "")
      const children = inline(node.children, format, options)
      const host = /^https?:\/\//i.test(href) ? new URL(href).hostname : ""
      if (!href || href.startsWith("#") || options.dropLinksTo.includes(host)) children.forEach(push)
      else {
        out.push({
          ...element("link", children),
          version: 3,
          id: options.newId(),
          fields: { linkType: "custom", url: href, newTab: Boolean(host) },
        })
      }
    } else if (tag === "img" || tag === "hr") continue
    else {
      // Blocks inside an inline context (a paragraph in a list item) are separated by a line break.
      const children = inline(node.children, format, options)
      if (!INLINE.has(tag) && out.length && children.length) out.push({ type: "linebreak", version: 1 })
      children.forEach(push)
    }
  }
  return out
}

/** Trims the run's outer spaces and line breaks; undefined when nothing visible is left. */
function tidy(nodes: LexicalNode[]): LexicalNode[] | undefined {
  while (nodes[0]?.type === "linebreak") nodes.shift()
  while (nodes[nodes.length - 1]?.type === "linebreak") nodes.pop()
  const first = nodes[0]
  const last = nodes[nodes.length - 1]
  if (first?.type === "text") first.text = String(first.text).replace(/^\s+/, "")
  if (last?.type === "text") last.text = String(last.text).replace(/\s+$/, "")
  const visible = (node: LexicalNode): boolean =>
    node.type === "text" ? String(node.text).trim() !== "" : ((node.children as LexicalNode[] | undefined) ?? []).some(visible)
  const kept = nodes.filter((node) => node.type !== "text" || node.text !== "")
  return kept.some(visible) ? kept : undefined
}

const withoutBold = (nodes: LexicalNode[]): LexicalNode[] =>
  nodes.map((node) => (node.type === "text" ? { ...node, format: Number(node.format) & ~BOLD } : node))

function blocks(nodes: Node[], options: Options): LexicalNode[] {
  const out: LexicalNode[] = []
  let run: Node[] = []
  const flush = () => {
    const children = tidy(inline(run, 0, options))
    if (children) out.push(element("paragraph", children, { textFormat: 0, textStyle: "" }))
    run = []
  }
  for (const node of nodes) {
    if (typeof node === "string" || INLINE.has(node.tag)) {
      run.push(node)
      continue
    }
    flush()
    const { tag } = node
    if (tag === "h2" || tag === "h1" || tag === "h3" || tag === "h4") {
      const children = tidy(withoutBold(inline(node.children, 0, options)))
      if (children) out.push(element("heading", children, { tag: tag === "h2" ? "h2" : "h3" }))
    } else if (tag === "h5" || tag === "h6") {
      const children = tidy(inline(node.children, BOLD, options))
      if (children) out.push(element("paragraph", children, { textFormat: BOLD, textStyle: "" }))
    } else if (tag === "p") {
      const children = tidy(inline(node.children, 0, options))
      if (children) out.push(element("paragraph", children, { textFormat: 0, textStyle: "" }))
    } else if (tag === "ul" || tag === "ol") {
      const items = node.children
        .filter((child): child is Element => typeof child !== "string" && child.tag === "li")
        .map((li) => tidy(inline(li.children, 0, options)))
        .filter((children): children is LexicalNode[] => Boolean(children))
        .map((children, index) => element("listitem", children, { value: index + 1 }))
      if (items.length) {
        const ordered = tag === "ol"
        out.push(element("list", items, { listType: ordered ? "number" : "bullet", start: 1, tag }))
      }
    } else if (tag === "hr") {
      if (out.length) out.push({ type: "horizontalrule", version: 1 })
    } else if (tag === "img" || tag === "script" || tag === "style") {
      continue
    } else {
      out.push(...blocks(node.children, options))
    }
  }
  flush()
  while (out[out.length - 1]?.type === "horizontalrule") out.pop()
  return out
}

/** The HTML as a Lexical document, or null when it has no visible text. */
export function htmlToLexical(
  html: string,
  { newId = () => randomBytes(12).toString("hex"), dropLinksTo = [] as string[] } = {}
): LexicalState | null {
  const children = blocks(parse(html).children, { newId, dropLinksTo })
  return children.length ? { root: element("root", children) } : null
}
