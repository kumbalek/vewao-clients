import type { PromotionTier } from "@lib/util/promotion-progress"

/**
 * Volume discounts on one product (vewao-platform#45): automatic promotions
 * that count that product's lines, such as the Christmas sale on Ultherapy's
 * areas (−10 % for one, −20 % for two or more). The cart applies them; the
 * product page only shows them.
 */
export type ProductTier = PromotionTier & { product_id: string }

/** The product's percentage tiers, lowest threshold first. */
export function tiersForProduct(tiers: ProductTier[] | null | undefined, productId: string): ProductTier[] {
  return (tiers ?? [])
    .filter((tier) => tier.product_id === productId && tier.type === "percentage" && tier.value > 0 && tier.min_count >= 1)
    .sort((a, b) => a.min_count - b.min_count)
}

/** The tier a count of chosen items reaches: the highest threshold at or below it. */
export function reachedTier(tiers: ProductTier[], count: number): ProductTier | null {
  let reached: ProductTier | null = null
  for (const tier of tiers) {
    if (tier.min_count <= count && (!reached || tier.min_count >= reached.min_count)) reached = tier
  }
  return reached
}

/** An amount less a percentage, to whole currency units as the cart shows it. */
export function discounted(amount: number, percent: number): number {
  return Math.round(amount * (1 - percent / 100) * 100) / 100
}
