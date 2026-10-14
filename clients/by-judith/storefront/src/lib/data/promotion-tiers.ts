"use server"

import { sdk } from "@lib/config"
import type { PromotionTier } from "@lib/util/promotion-progress"

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
