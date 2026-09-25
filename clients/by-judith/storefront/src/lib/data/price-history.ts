"use server"

import { sdk } from "@lib/config"
import type { PriceReference } from "@lib/util/discount-claim"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders } from "./cookies"

/**
 * Omnibus reference prices for a product's variants, from the platform's price
 * ledger. Never cached: a reduction claim must not rest on a stale answer, and
 * it is fetched only for products on sale. If the cached product price differs
 * from the ledger's current price, the claim is suppressed. Failure yields no
 * references, which also means no claim.
 */
export async function listPriceReferences(
  productId: string,
  regionId: string
): Promise<PriceReference[]> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{ variants: PriceReference[] }>(
      `/store/products/${productId}/price-history`,
      {
        method: "GET",
        query: { region_id: regionId },
        headers,
        cache: "no-store",
      }
    )
    .then(({ variants }) => variants)
    .catch(() => [])
}

/** References only for products that show a sale price; others need none. */
export async function listSalePriceReferences(
  product: HttpTypes.StoreProduct,
  regionId: string
): Promise<PriceReference[]> {
  const onSale = product.variants?.some(
    (variant) =>
      variant.calculated_price?.calculated_price?.price_list_type === "sale"
  )
  return onSale ? listPriceReferences(product.id, regionId) : []
}
