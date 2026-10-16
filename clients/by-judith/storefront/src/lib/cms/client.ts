import "server-only"

import { cookies, draftMode } from "next/headers"

import type { LexicalState } from "./lexical"
import { PREVIEW_COOKIE, verifyPreview, type PreviewGrant } from "./preview-token"

/**
 * Content from the Payload CMS (spike, vewao-platform#27). Published content
 * is cached per tag and revalidated when the CMS publishes; drafts are read
 * only for a valid preview grant, uncached, with the storefront's API key.
 */

export type CmsMedia = { id: number; url: string; alt: string; width?: number; height?: number }
export type CmsBlock =
  | { blockType: "hero"; id: string; heading: string; text?: string | null; image?: CmsMedia | null; cta?: { label?: string | null; href?: string | null } }
  | { blockType: "richText"; id: string; content: LexicalState }
  | { blockType: "newsList"; id: string; heading?: string | null; limit?: number | null }
  | { blockType: "productFeature"; id: string; product: { id: number; handle: string; title: string } | number; note?: string | null }
export type CmsPage = { id: number; title: string; slug: string; layout?: CmsBlock[] | null; _status: "draft" | "published" }
export type CmsNews = { id: number; title: string; perex: string; href?: string | null; validUntil?: string | null; image?: CmsMedia | null }

/** Fallback when a revalidation call is missed. */
const MAX_AGE_SECONDS = 300

export const cmsPublicUrl = () => process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/+$/, "") ?? ""
export const cmsMediaUrl = (media: CmsMedia) => `${cmsPublicUrl()}${media.url}`

/** The preview grant for this request's path, if draft mode was opened for it. */
export async function previewGrantFor(path: string): Promise<PreviewGrant | null> {
  if (!(await draftMode()).isEnabled) return null
  const raw = (await cookies()).get(PREVIEW_COOKIE)?.value
  if (!raw) return null
  try {
    const grant = verifyPreview(process.env.CMS_PREVIEW_SECRET, JSON.parse(raw))
    return grant?.path === path ? grant : null
  } catch {
    return null
  }
}

async function cmsFetch<T>(path: string, options: { draft: boolean; tags: string[] }): Promise<T | null> {
  const base = process.env.CMS_URL?.replace(/\/+$/, "")
  if (!base) return null
  const url = `${base}/api/${path}${options.draft ? `${path.includes("?") ? "&" : "?"}draft=true` : ""}`
  const response = await fetch(
    url,
    options.draft
      ? { cache: "no-store", headers: { authorization: `users API-Key ${process.env.CMS_API_KEY ?? ""}` } }
      : { next: { tags: options.tags, revalidate: MAX_AGE_SECONDS } }
  )
  if (!response.ok) throw new Error(`CMS ${response.status} for ${path}`)
  return (await response.json()) as T
}

export async function getCmsPage(slug: string, draft: boolean): Promise<CmsPage | null> {
  const query = new URLSearchParams({ "where[slug][equals]": slug, depth: "2", limit: "1" })
  const result = await cmsFetch<{ docs: CmsPage[] }>(`pages?${query}`, { draft, tags: [`cms:pages:${slug}`] })
  return result?.docs[0] ?? null
}

export async function listCmsNews(limit: number, draft: boolean): Promise<CmsNews[]> {
  const query = new URLSearchParams({ sort: "_order", depth: "1", limit: String(limit) })
  const result = await cmsFetch<{ docs: CmsNews[] }>(`news?${query}`, { draft, tags: ["cms:news"] })
  return result?.docs ?? []
}
