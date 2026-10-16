import "server-only"

import config from "@payload-config"
import { unstable_cache } from "next/cache"
import { cookies, draftMode } from "next/headers"
import { getPayload } from "payload"

import type { LexicalState } from "./lexical"
import { PREVIEW_COOKIE, previewSecret, verifyPreview, type PreviewGrant } from "./preview-token"

/**
 * Content from the embedded Payload CMS (D22), read in-process with the Local
 * API. Published content is cached per tag; publishing expires the tag (see
 * src/cms/hooks). Drafts are read uncached, only for a valid preview grant.
 */

export type CmsMedia = { id: number; url: string; alt: string; width?: number; height?: number }
export type CmsBlock =
  | { blockType: "hero"; id: string; heading: string; text?: string | null; image?: CmsMedia | number | null; cta?: { label?: string | null; href?: string | null } }
  | { blockType: "richText"; id: string; content: LexicalState }
  | { blockType: "newsList"; id: string; heading?: string | null; limit?: number | null }
  | { blockType: "productFeature"; id: string; product: { id: number; handle: string; title: string } | number; note?: string | null }
export type CmsPage = { id: number; title: string; slug: string; layout?: CmsBlock[] | null; _status?: "draft" | "published" | null }
export type CmsNews = { id: number; title: string; perex: string; href?: string | null; validUntil?: string | null; image?: CmsMedia | number | null }

/** Fallback if a publish hook could not expire the cache. */
const MAX_AGE_SECONDS = 300

export const cmsMediaUrl = (media: CmsMedia) => media.url

/** The preview grant for this request's path, if draft mode was opened for it. */
export async function previewGrantFor(path: string): Promise<PreviewGrant | null> {
  if (!(await draftMode()).isEnabled) return null
  const raw = (await cookies()).get(PREVIEW_COOKIE)?.value
  if (!raw) return null
  try {
    const grant = verifyPreview(previewSecret(), JSON.parse(raw))
    return grant?.path === path ? grant : null
  } catch {
    return null
  }
}

async function findPage(slug: string, draft: boolean): Promise<CmsPage | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    draft,
    // Visitors get published documents only; drafts only inside a preview grant.
    overrideAccess: draft,
  })
  return (result.docs[0] as unknown as CmsPage | undefined) ?? null
}

async function findNews(limit: number, draft: boolean): Promise<CmsNews[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: "news", sort: "_order", depth: 1, limit, draft, overrideAccess: draft })
  return result.docs as unknown as CmsNews[]
}

export async function getCmsPage(slug: string, draft: boolean): Promise<CmsPage | null> {
  if (draft) return findPage(slug, true)
  return unstable_cache(() => findPage(slug, false), ["cms-page", slug], {
    tags: [`cms:pages:${slug}`],
    revalidate: MAX_AGE_SECONDS,
  })()
}

export async function listCmsNews(limit: number, draft: boolean): Promise<CmsNews[]> {
  if (draft) return findNews(limit, true)
  return unstable_cache(() => findNews(limit, false), ["cms-news", String(limit)], {
    tags: ["cms:news"],
    revalidate: MAX_AGE_SECONDS,
  })()
}
