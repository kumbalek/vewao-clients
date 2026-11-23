import type { PriceReference } from "@lib/util/discount-claim"
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

type PricedVariant = { id: string; calculated_price?: { calculated_amount?: number | null } | null }

/**
 * Whether the price ledger confirms the chosen variants' regular prices as
 * the lowest of the 30 days before (§ 12a), so a volume discount may strike
 * them through: for every variant the history is complete, the ledger's
 * current price is the one shown, and nothing lower was applied in the
 * window. Otherwise the discounted price is shown without a struck price.
 */
export function regularIsLowest(variants: PricedVariant[], references: PriceReference[]): boolean {
  return (
    variants.length > 0 &&
    variants.every((variant) => {
      const reference = references.find((r) => r.variant_id === variant.id)
      const shown = variant.calculated_price?.calculated_amount
      return (
        !!reference &&
        reference.history_complete &&
        shown != null &&
        reference.current_amount != null &&
        Number(reference.current_amount) === Number(shown) &&
        reference.reference_price != null &&
        Number(reference.reference_price) >= Number(reference.current_amount)
      )
    })
  )
}
