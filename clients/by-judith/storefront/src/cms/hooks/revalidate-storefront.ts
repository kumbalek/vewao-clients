import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

type Tagged = { _status?: 'draft' | 'published' | null } & Record<string, unknown>

/**
 * Expires the storefront's cached content. Only publishing (or unpublishing and
 * deleting) matters: autosaved drafts never reach visitors. Outside a Next.js
 * request (migrations, scripts) there is no cache to expire.
 */
function expire(req: PayloadRequest, tags: string[]) {
  for (const tag of tags) {
    try {
      revalidateTag(tag, { expire: 0 })
    } catch (error) {
      req.payload.logger.debug(`Cache tag ${tag} not revalidated: ${(error as Error).message}`)
    }
  }
}

/** `tagsFor` maps a document to its cache tags, e.g. `cms:pages:o-nas`. */
export const revalidateOnPublish =
  (tagsFor: (doc: Tagged) => string[]): CollectionAfterChangeHook =>
  ({ doc, previousDoc, req }) => {
    if (doc._status === 'published' || previousDoc?._status === 'published') {
      expire(req, Array.from(new Set([...tagsFor(doc), ...(previousDoc ? tagsFor(previousDoc) : [])])))
    }
    return doc
  }

export const revalidateOnDelete =
  (tagsFor: (doc: Tagged) => string[]): CollectionAfterDeleteHook =>
  ({ doc, req }) => {
    expire(req, tagsFor(doc))
    return doc
  }
