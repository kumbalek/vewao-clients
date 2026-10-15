import "server-only"

import { listContentItems, type ContentItem, type ImageMetadata } from "@lib/data/content"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { activeNews } from "@lib/util/novinky"
import { HttpTypes } from "@medusajs/types"

/** Editors' news and offers (admin → Obsah, seed/setup-novinky.ts). */
export const NOVINKY = "novinky"

export type NewsPost = ContentItem<
  ImageMetadata & {
    perex?: string | null
    odkaz?: string | null
    platnost_do?: string | null
    poradi?: number | null
  }
>

/** Current posts, pinned first; none (not an error page) while the collection is missing. */
export async function listNews(): Promise<NewsPost[]> {
  try {
    return activeNews(await listContentItems<NonNullable<NewsPost["metadata"]>>(NOVINKY), new Date())
  } catch (error) {
    console.error("Novinky could not be loaded", error)
    return []
  }
}

/**
 * Products whose cheapest price comes from a sale price list. The catalogue
 * is small, so it is filtered here; Medusa's store API has no "on sale" filter.
 */
export async function listSaleProducts(countryCode: string): Promise<HttpTypes.StoreProduct[]> {
  const { response } = await listProducts({ countryCode, queryParams: { limit: 100 } })
  return response.products.filter(
    (product) => getProductPrice({ product }).cheapestPrice?.price_type === "sale"
  )
}
