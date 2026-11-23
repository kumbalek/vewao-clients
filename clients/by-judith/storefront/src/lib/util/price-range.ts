type PricedProduct = {
  variants?: { calculated_price?: { calculated_amount?: number | null } | null }[] | null
}

/**
 * Whether a product's variants cost different amounts (owner, 2026-11-22):
 * then its cheapest price, shown before a variant is chosen, reads "Od …".
 */
export function hasPriceRange(product: PricedProduct | null | undefined): boolean {
  const amounts = new Set(
    (product?.variants ?? [])
      .map((variant) => variant.calculated_price?.calculated_amount)
      .filter((amount): amount is number => amount != null)
  )
  return amounts.size > 1
}
