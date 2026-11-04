import { randomBytes } from "node:crypto"

/**
 * The Markdown the magazine snapshot uses, as Payload's Lexical JSON:
 * paragraphs, hard line breaks (backslash-newline), **bold**, *italic*,
 * backslash escapes, [links](<url>) and bare www./http(s) addresses, which
 * GFM links as well. Nothing else occurs in magazin.json;
 * anything else stays literal text rather than being guessed at.
 */

type LexicalNode = { type: string; version: number; [key: string]: unknown }
export type LexicalState = { root: LexicalNode }

const BOLD = 1
const ITALIC = 2

type Token =
  | { kind: "text"; text: string }
  | { kind: "break" }
  | { kind: "delim"; marker: "**" | "*" }
  | { kind: "link"; label: string; url: string }
  | { kind: "autolink"; text: string; url: string }

const ESCAPABLE = /[!-/:-@[-`{-~]/

/** A GFM autolink literal at `rest`, without trailing punctuation. */
function autolink(rest: string, previous: string | undefined): string | null {
  if (previous !== undefined && !/[\s(*_~]/.test(previous)) return null
  const match = /^(?:https?:\/\/|www\.)[^\s<]+/i.exec(rest)
  if (!match) return null
  let text = match[0].replace(/[?!.,:*_~]+$/, "")
  // A closing parenthesis belongs to the address only if it opened one.
  while (text.endsWith(")") && (text.match(/\)/g) ?? []).length > (text.match(/\(/g) ?? []).length) {
    text = text.slice(0, -1).replace(/[?!.,:*_~]+$/, "")
  }
  return /^www\.[^.]+\./i.test(text) || /^https?:\/\/./i.test(text) ? text : null
}

function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  const text = (value: string) => {
    const last = tokens[tokens.length - 1]
    if (last?.kind === "text") last.text += value
    else tokens.push({ kind: "text", text: value })
  }
  let i = 0
  while (i < source.length) {
    const rest = source.slice(i)
    if (rest.startsWith("\\\n")) {
      tokens.push({ kind: "break" })
      i += 2
    } else if (source[i] === "\\" && ESCAPABLE.test(source[i + 1] ?? "")) {
      text(source[i + 1])
      i += 2
    } else if (source[i] === "\n") {
      // A soft line break is a space, as in rendered Markdown.
      text(" ")
      i += 1
    } else if (rest.startsWith("**")) {
      tokens.push({ kind: "delim", marker: "**" })
      i += 2
    } else if (source[i] === "*") {
      tokens.push({ kind: "delim", marker: "*" })
      i += 1
    } else {
      const link = /^\[([^\]]*)\]\((?:<([^>]*)>|([^)\s]*))\)/.exec(rest)
      const bare = link ? null : autolink(rest, source[i - 1])
      if (link) {
        tokens.push({ kind: "link", label: link[1], url: link[2] ?? link[3] })
        i += link[0].length
      } else if (bare) {
        tokens.push({ kind: "autolink", text: bare, url: /^www\./i.test(bare) ? `http://${bare}` : bare })
        i += bare.length
      } else {
        text(source[i])
        i += 1
      }
    }
  }
  return tokens
}

/** A delimiter without a partner is literal text. */
function pairDelimiters(tokens: Token[]): Token[] {
  for (const marker of ["**", "*"] as const) {
    const indexes = tokens.flatMap((t, i) => (t.kind === "delim" && t.marker === marker ? [i] : []))
    if (indexes.length % 2 === 1) tokens[indexes[indexes.length - 1]] = { kind: "text", text: marker }
  }
  return tokens
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

function inline(source: string, newId: () => string, baseFormat = 0): LexicalNode[] {
  const nodes: LexicalNode[] = []
  let format = baseFormat
  const push = (node: LexicalNode) => {
    const last = nodes[nodes.length - 1]
    if (node.type === "text" && last?.type === "text" && last.format === node.format) {
      last.text = `${last.text}${node.text}`
    } else nodes.push(node)
  }
  for (const token of pairDelimiters(tokenize(source))) {
    if (token.kind === "text") push(textNode(token.text, format))
    else if (token.kind === "break") nodes.push({ type: "linebreak", version: 1 })
    else if (token.kind === "delim") format ^= token.marker === "**" ? BOLD : ITALIC
    else if (token.kind === "autolink") {
      nodes.push({
        ...element("autolink", [textNode(token.text, format)]),
        version: 2,
        fields: { linkType: "custom", url: token.url, newTab: true },
      })
    } else {
      const external = /^https?:\/\//i.test(token.url)
      nodes.push({
        ...element("link", inline(token.label, newId, format)),
        version: 3,
        id: newId(),
        fields: { linkType: "custom", url: token.url, newTab: external },
      })
    }
  }
  return nodes
}

export function markdownToLexical(
  markdown: string,
  newId: () => string = () => randomBytes(12).toString("hex")
): LexicalState {
  const paragraphs = markdown
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => element("paragraph", inline(block, newId), { textFormat: 0, textStyle: "" }))
  return { root: element("root", paragraphs) }
}
