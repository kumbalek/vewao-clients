import { createElement as h } from "react"
import type { ReactNode } from "react"

/**
 * Renders Payload's Lexical rich-text JSON as React elements.
 *
 * No JSX and no dangerouslySetInnerHTML: this module must stay loadable by
 * `node --experimental-strip-types` and must never inject raw HTML.
 */

export type LexicalNode = {
  type: string
  children?: LexicalNode[]
  [key: string]: unknown
}

export type LexicalState = { root: LexicalNode } | null | undefined

// Lexical text format bitmask, in nesting order (bold outermost).
const FORMAT_WRAPPERS: Array<[number, string]> = [
  [1, "strong"],
  [2, "em"],
  [4, "s"],
  [8, "u"],
  [16, "code"],
  [32, "sub"],
  [64, "sup"],
]

// hrefs are only allowed for safe schemes/paths; anything else (e.g.
// "javascript:") loses its anchor but keeps its text.
const SAFE_HREF = /^(\/(?![/\\])|#|https?:\/\/|mailto:|tel:)/i

function safeHref(url: unknown): string | null {
  if (typeof url !== "string" || !SAFE_HREF.test(url)) return null
  return url
}

function linkFields(node: LexicalNode): { url: unknown; newTab: boolean } {
  const fields =
    typeof node.fields === "object" && node.fields !== null
      ? (node.fields as Record<string, unknown>)
      : {}
  return {
    url: fields.url,
    newTab: fields.newTab === true,
  }
}

function renderText(node: LexicalNode, key: number): ReactNode {
  let result: ReactNode = typeof node.text === "string" ? node.text : ""
  const format = typeof node.format === "number" ? node.format : 0
  // Wrapping runs innermost-first, so bold (first in the list) ends up outermost.
  const tags = FORMAT_WRAPPERS.filter(([bit]) => format & bit).map(([, tag]) => tag)
  for (let i = tags.length - 1; i >= 0; i--) {
    // Only the outermost wrapper is a sibling, so only it needs the key.
    result = h(tags[i], i === 0 ? { key } : null, result)
  }
  return result
}

// Renders a list of siblings; every element gets the sibling index as its key.
function renderSiblings(nodes: LexicalNode[] | undefined): ReactNode[] {
  const list = nodes ?? []
  const out: ReactNode[] = []
  for (let i = 0; i < list.length; i++) {
    const rendered = renderNode(list[i], i)
    if (rendered !== null) out.push(rendered)
  }
  return out
}

function renderNode(node: LexicalNode, key: number): ReactNode {
  switch (node.type) {
    case "root":
      return renderSiblings(node.children)

    case "paragraph": {
      const children = renderSiblings(node.children)
      // An empty paragraph renders nothing, not <p><br/></p>.
      return children.length ? h("p", { key }, children) : null
    }

    case "heading": {
      // The page owns the only h1, so h1 from the CMS is downgraded to h2.
      const tag =
        typeof node.tag === "string" && /^h[2-6]$/.test(node.tag) ? node.tag : "h2"
      return h(tag, { key }, renderSiblings(node.children))
    }

    case "list": {
      const tag = node.listType === "number" ? "ol" : "ul"
      return h(tag, { key }, renderSiblings(node.children))
    }

    case "listitem":
      return h("li", { key }, renderSiblings(node.children))

    case "quote":
      return h("blockquote", { key }, renderSiblings(node.children))

    case "link":
    case "autolink": {
      const { url, newTab } = linkFields(node)
      const href = safeHref(url)
      const children = renderSiblings(node.children)
      if (href === null) return children.length ? children : null
      return h(
        "a",
        {
          key,
          href,
          ...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {}),
        },
        children,
      )
    }

    case "linebreak":
      return h("br", { key })

    case "horizontalrule":
      return h("hr", { key })

    case "text":
      return renderText(node, key)

    default:
      // Unknown node type: keep its children, never throw.
      return node.children?.length ? renderSiblings(node.children) : null
  }
}

export function renderLexical(state: LexicalState): ReactNode {
  if (state == null || state.root == null) return null
  return renderNode(state.root, 0)
}
