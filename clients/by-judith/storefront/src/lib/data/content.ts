import "server-only"

import { sdk } from "@lib/config"

/**
 * The Content plugin's public API: published items only. The plugin caches
 * responses for five minutes; Next revalidates on the same interval.
 */

const REVALIDATE = 300
// Lists are read whole and filtered here; collections stay small.
const MAX_ITEMS = 200

export type ContentImage = {
  url: string
  alt: string | null
  width?: number | null
  height?: number | null
}

/** The image fields the imports and admin use: image, image_alt, image_width, image_height. */
export type ImageMetadata = {
  image?: string | null
  image_alt?: string | null
  image_width?: number | null
  image_height?: number | null
}

export type ContentItem<M extends object = Record<string, unknown>> = {
  id: string
  title: string
  slug: string
  body: string | null
  /** Sanitised HTML rendered by the plugin; Markdown items on detail requests only. */
  body_html?: string
  published_at: string | null
  created_at: string
  tags: { id: string; value: string }[]
  content_collection?: { slug: string }
  metadata: M | null
}

/** All published items of a collection, newest first. */
export async function listContentItems<M extends object>(collection: string): Promise<ContentItem<M>[]> {
  const { content_items, count } = await sdk.client.fetch<{
    content_items: ContentItem<M>[]
    count: number
  }>(`/content/${collection}/items`, {
    query: { limit: MAX_ITEMS, order: "-created_at" },
    next: { revalidate: REVALIDATE, tags: [collection] },
  })

  if (count > content_items.length) {
    console.warn(`Content "${collection}": ${count} items, only ${content_items.length} listed`)
  }
  return content_items
}

/** A published item with rendered HTML, or null when it does not exist. */
export async function getContentItem<M extends object>(
  collection: string,
  slug: string
): Promise<ContentItem<M> | null> {
  try {
    const { content_item } = await sdk.client.fetch<{ content_item: ContentItem<M> }>(
      `/content/${collection}/items/${encodeURIComponent(slug)}`,
      {
        query: { render: "html" },
        next: { revalidate: REVALIDATE, tags: [collection] },
      }
    )
    // The plugin looks items up by slug alone; keep other collections out.
    return content_item.content_collection?.slug === collection ? content_item : null
  } catch (error) {
    if ((error as { status?: number }).status === 404) return null
    throw error
  }
}

export function contentImage(item: ContentItem<ImageMetadata>): ContentImage | null {
  const url = item.metadata?.image
  return url
    ? {
        url,
        alt: item.metadata?.image_alt ?? null,
        width: item.metadata?.image_width,
        height: item.metadata?.image_height,
      }
    : null
}

/** Markdown as plain text: link text kept, syntax dropped. */
const markdownToPlain = (markdown: string) =>
  markdown
    .replace(/\[([^\]]*)\]\(<[^>]*>\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\\\n/g, " ")
    .replace(/(?<!\\)\*+/g, "")
    .replace(/\\(.)/g, "$1")

/** Teaser text: the given summary, else the start of the Markdown body. */
export function teaser(summary: string | null | undefined, body: string | null, length = 180): string {
  const text = (summary || markdownToPlain(body ?? "")).replace(/\s+/g, " ").trim()
  return text.length > length ? `${text.slice(0, length).replace(/\s+\S*$/, "")}…` : text
}
