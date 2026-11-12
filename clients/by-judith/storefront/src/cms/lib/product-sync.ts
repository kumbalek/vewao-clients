import type { PayloadHandler, PayloadRequest } from 'payload'

import {
  parseDeleteIds,
  parseSyncProducts,
  productTextsFromMedusa,
  syncAction,
  type ExistingProductDoc,
  type SyncProduct,
} from '@lib/cms/product-texts'

import { hasRole } from '../access/roles'

/**
 * Medusa's product sync (vewao-platform#33), as Payload endpoints for the
 * `medusa` API-key user (D22). Medusa owns the product, so the sync creates and
 * deletes documents and keeps the handle and title current. It never changes
 * texts or publication: editors own those.
 */

export type SyncResult = {
  created: string[]
  renamed: string[]
  /** Renames waiting for an editor's pending draft; the next sync retries them. */
  pending: string[]
  unchanged: string[]
  failed: { id: string; error: string }[]
}

type ProductDoc = ExistingProductDoc & { id: number; medusaId: string }

const message = (error: unknown) => (error instanceof Error ? error.message : String(error)).slice(0, 300)

async function readBody(req: PayloadRequest): Promise<unknown> {
  try {
    return await req.json?.()
  } catch {
    return undefined
  }
}

async function syncProducts(req: PayloadRequest, products: SyncProduct[]): Promise<SyncResult> {
  const result: SyncResult = { created: [], renamed: [], pending: [], unchanged: [], failed: [] }
  if (!products.length) return result
  // The latest version of each document: a pending draft shows as `_status: draft`.
  const { docs } = await req.payload.find({
    collection: 'products',
    where: { medusaId: { in: products.map((product) => product.id) } },
    draft: true,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })
  const existing = new Map((docs as unknown as ProductDoc[]).map((doc) => [doc.medusaId, doc]))

  for (const product of products) {
    const doc = existing.get(product.id)
    const action = syncAction(doc, product)
    try {
      if (action === 'create') {
        await req.payload.create({
          collection: 'products',
          data: {
            medusaId: product.id,
            handle: product.handle,
            title: product.title,
            ...productTextsFromMedusa(product),
            _status: 'published',
          } as never,
          overrideAccess: true,
          req,
        })
        result.created.push(product.id)
      } else if (action === 'rename' && doc) {
        await req.payload.update({
          collection: 'products',
          id: doc.id,
          data: { handle: product.handle, title: product.title, _status: 'published' },
          overrideAccess: true,
          req,
        })
        result.renamed.push(product.id)
      } else if (action === 'pending') {
        result.pending.push(product.id)
      } else {
        result.unchanged.push(product.id)
      }
    } catch (error) {
      req.payload.logger.error(`Product sync for ${product.id} failed: ${message(error)}`)
      result.failed.push({ id: product.id, error: message(error) })
    }
  }
  return result
}

const forbidden = () => Response.json({ error: 'Only the Medusa integration user may sync products' }, { status: 403 })

/** POST /api/products/medusa-sync with `{ products: SyncProduct[] }`. */
export const syncEndpoint: PayloadHandler = async (req) => {
  if (!hasRole(req.user, 'medusa')) return forbidden()
  const products = parseSyncProducts(await readBody(req))
  if (typeof products === 'string') return Response.json({ error: products }, { status: 400 })
  const result = await syncProducts(req, products)
  return Response.json(result, { status: result.failed.length ? 207 : 200 })
}

/** POST /api/products/medusa-delete with `{ ids: string[] }`: the products Medusa deleted. */
export const deleteEndpoint: PayloadHandler = async (req) => {
  if (!hasRole(req.user, 'medusa')) return forbidden()
  const ids = parseDeleteIds(await readBody(req))
  if (typeof ids === 'string') return Response.json({ error: ids }, { status: 400 })
  if (!ids.length) return Response.json({ deleted: [] })
  const { docs, errors } = await req.payload.delete({
    collection: 'products',
    where: { medusaId: { in: ids } },
    overrideAccess: true,
    req,
  })
  for (const error of errors) req.payload.logger.error(`Product delete failed: ${message(error.message)}`)
  return Response.json(
    { deleted: (docs as unknown as ProductDoc[]).map((doc) => doc.medusaId), failed: errors.length },
    { status: errors.length ? 207 : 200 }
  )
}
