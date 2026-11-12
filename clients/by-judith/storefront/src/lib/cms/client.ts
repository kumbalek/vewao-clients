import "server-only"

import config from "@payload-config"
import { unstable_cache } from "next/cache"
import { cookies, draftMode } from "next/headers"
import { getPayload } from "payload"

import type { LexicalState } from "./lexical"
import type { Procedure as CmsProcedure, ProcedureCategory as CmsProcedureCategory, Product as CmsProduct } from "../../cms/payload-types"
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
export type CmsTopic = { id: number; name: string }
export type CmsArticle = {
  id: number
  title: string
  slug: string
  publishedAt?: string | null
  topics?: (CmsTopic | number)[] | null
  excerpt?: string | null
  image?: CmsMedia | number | null
  body?: LexicalState
  gallery?: (CmsMedia | number)[] | null
  createdAt: string
  _status?: "draft" | "published" | null
}
export type { CmsProcedure, CmsProcedureCategory, CmsProduct }
export type CmsNews = { id: number; title: string; perex: string; href?: string | null; validUntil?: string | null; image?: CmsMedia | number | null }

/** Fallback if a publish hook could not expire the cache. */
const MAX_AGE_SECONDS = 300

/**
 * Payload prefixes its files with the shop's own origin (serverURL). The shop
 * serves them itself, so next/image gets the path: a local image, not a remote
 * host it would have to allow and fetch over the network.
 */
export function cmsMediaUrl(media: CmsMedia): string {
  const origin = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "")
  return origin && media.url.startsWith(`${origin}/`) ? media.url.slice(origin.length) : media.url
}

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

// The magazine is small; it is read whole and filtered in the storefront.
const MAX_ARTICLES = 500

async function findArticles(draft: boolean, slug?: string): Promise<CmsArticle[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "articles",
    ...(slug ? { where: { slug: { equals: slug } }, limit: 1 } : { limit: MAX_ARTICLES }),
    sort: "-createdAt",
    depth: 1,
    draft,
    // Visitors get published articles only; a draft only inside a preview grant.
    overrideAccess: draft,
  })
  if (!slug && result.totalDocs > result.docs.length) {
    console.warn(`Magazín: ${result.totalDocs} articles, only ${result.docs.length} listed`)
  }
  return result.docs as unknown as CmsArticle[]
}

/** Published articles, newest first. */
export function listCmsArticles(): Promise<CmsArticle[]> {
  return unstable_cache(() => findArticles(false), ["cms-articles"], {
    tags: ["cms:articles"],
    revalidate: MAX_AGE_SECONDS,
  })()
}

/** One article: the latest draft inside a preview grant, else the published version. */
export async function getCmsArticle(slug: string, draft: boolean): Promise<CmsArticle | null> {
  if (draft) return (await findArticles(true, slug))[0] ?? null
  return unstable_cache(async () => (await findArticles(false, slug))[0] ?? null, ["cms-article", slug], {
    tags: ["cms:articles"],
    revalidate: MAX_AGE_SECONDS,
  })()
}

// Two categories and a few dozen procedures: read whole, arranged in the storefront.
const MAX_PROCEDURES = 500
export type CmsProcedureDocs = { categories: CmsProcedureCategory[]; procedures: CmsProcedure[] }

async function findProcedureDocs(): Promise<CmsProcedureDocs> {
  const payload = await getPayload({ config })
  const [categories, procedures] = await Promise.all([
    payload.find({ collection: "procedure-categories", sort: "_order", depth: 1, limit: MAX_PROCEDURES, overrideAccess: false }),
    payload.find({ collection: "procedures", sort: "_order", depth: 1, limit: MAX_PROCEDURES, overrideAccess: false }),
  ])
  if (procedures.totalDocs > procedures.docs.length) {
    console.warn(`Procedury: ${procedures.totalDocs} procedures, only ${procedures.docs.length} listed`)
  }
  return { categories: categories.docs, procedures: procedures.docs }
}

/** Published categories and procedures, in menu order. */
export function listCmsProcedureDocs(): Promise<CmsProcedureDocs> {
  return unstable_cache(findProcedureDocs, ["cms-procedures"], {
    tags: ["cms:procedures"],
    revalidate: MAX_AGE_SECONDS,
  })()
}

export type CmsProcedureDraft =
  | { collection: "procedure-categories"; doc: CmsProcedureCategory }
  | { collection: "procedures"; doc: CmsProcedure }

/** The latest draft at a slug, for a preview grant: a category or a procedure. */
export async function getCmsProcedureDraft(slug: string): Promise<CmsProcedureDraft | null> {
  const payload = await getPayload({ config })
  const where = { slug: { equals: slug } }
  const [categories, procedures] = await Promise.all([
    payload.find({ collection: "procedure-categories", where, depth: 1, limit: 1, draft: true, overrideAccess: true }),
    payload.find({ collection: "procedures", where, depth: 1, limit: 1, draft: true, overrideAccess: true }),
  ])
  if (categories.docs[0]) return { collection: "procedure-categories", doc: categories.docs[0] }
  if (procedures.docs[0]) return { collection: "procedures", doc: procedures.docs[0] }
  return null
}

/**
 * A product's texts: its published document, or its latest draft inside a
 * preview grant. "missing" when the product has no document at all (not yet
 * synced from Medusa); an unpublished document is not missing.
 */
async function findProduct(medusaId: string, draft: boolean): Promise<CmsProduct | "missing" | null> {
  const payload = await getPayload({ config })
  const where = { medusaId: { equals: medusaId } }
  const result = await payload.find({ collection: "products", where, depth: 0, limit: 1, draft, overrideAccess: draft })
  if (result.docs[0]) return result.docs[0]
  const { totalDocs } = await payload.count({ collection: "products", where, overrideAccess: true })
  return totalDocs ? null : "missing"
}

export async function getCmsProduct(medusaId: string, handle: string, draft: boolean): Promise<CmsProduct | "missing" | null> {
  if (draft) return findProduct(medusaId, true)
  return unstable_cache(() => findProduct(medusaId, false), ["cms-product", medusaId], {
    tags: [`cms:products:${handle}`],
    revalidate: MAX_AGE_SECONDS,
  })()
}
