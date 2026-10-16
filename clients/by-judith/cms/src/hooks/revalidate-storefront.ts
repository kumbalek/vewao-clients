import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

type Tagged = { _status?: 'draft' | 'published' | null } & Record<string, unknown>

/**
 * Tells the storefront which cached content changed. Only publishing (or
 * unpublishing/deleting) matters: autosaved drafts never reach visitors.
 * A failed call is logged, not fatal: the storefront's cache also expires.
 */
async function revalidate(req: PayloadRequest, tags: string[]) {
  const url = process.env.STOREFRONT_URL
  const secret = process.env.STOREFRONT_REVALIDATE_SECRET
  if (!url || !secret || !tags.length) return
  try {
    const response = await fetch(`${url.replace(/\/+$/, '')}/api/cms/revalidate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) req.payload.logger.warn(`Storefront revalidation returned ${response.status} for ${tags.join(', ')}`)
  } catch (error) {
    req.payload.logger.warn(`Storefront revalidation failed for ${tags.join(', ')}: ${(error as Error).message}`)
  }
}

/** `tagsFor` maps a document to its cache tags, e.g. `cms:pages:o-nas`. */
export const revalidateOnPublish =
  (tagsFor: (doc: Tagged) => string[]): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req }) => {
    const published = doc._status === 'published'
    const wasPublished = previousDoc?._status === 'published'
    if (published || wasPublished) {
      await revalidate(req, [...new Set([...tagsFor(doc), ...(previousDoc ? tagsFor(previousDoc) : [])])])
    }
    return doc
  }

export const revalidateOnDelete =
  (tagsFor: (doc: Tagged) => string[]): CollectionAfterDeleteHook =>
  async ({ doc, req }) => {
    await revalidate(req, tagsFor(doc))
    return doc
  }
