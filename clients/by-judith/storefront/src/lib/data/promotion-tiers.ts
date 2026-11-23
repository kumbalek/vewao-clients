"use server"

import { sdk } from "@lib/config"
import type { PromotionTier } from "@lib/util/promotion-progress"
import { tiersForProduct, type ProductTier } from "@lib/util/product-tiers"

/**
 * Quantity tiers switched on in admin (vewao-platform
 * `GET /store/promotion-tiers`). The cart applies the discount itself; this
 * only feeds the progress bar, so a failure hides the bar and nothing else.
 */
export async function listPromotionTiers(): Promise<PromotionTier[]> {
  try {
    const { tiers } = await sdk.client.fetch<{ tiers: PromotionTier[] }>(
      "/store/promotion-tiers",
      { method: "GET", cache: "no-store" }
    )
    return tiers
  } catch (error) {
    console.error("Promotion tiers could not be loaded", error)
    return []
  }
}

/**
 * A product's volume discounts (vewao-platform#45, `product_tiers`), for the
 * product page's discount boxes. A failure hides the boxes; the cart still
 * applies whatever promotions run.
 */
export async function listProductTiers(productId: string): Promise<ProductTier[]> {
  try {
    const { product_tiers } = await sdk.client.fetch<{ product_tiers?: ProductTier[] }>(
      "/store/promotion-tiers",
      { method: "GET", cache: "no-store" }
    )
    return tiersForProduct(product_tiers, productId)
  } catch (error) {
    console.error("Product tiers could not be loaded", error)
    return []
  }
}
