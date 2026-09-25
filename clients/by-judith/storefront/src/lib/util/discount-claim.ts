/** One variant's entry from the backend's `/store/products/:id/price-history`. */
export type PriceReference = {
  variant_id: string
  current_amount: number | null
  reference_price: number | null
  history_complete: boolean
}

export type DiscountClaim = {
  /** Lowest price in the 30 days before the reduction: the only price to strike through. */
  referenceAmount: number
  /** Rounded down, so a claim never overstates the reduction. */
  percentage: number
}

/**
 * Whether a displayed sale price may be announced as a reduction, and against
 * what. Omnibus requires the prior price to be the lowest price applied in the
 * 30 days before the reduction, so the claim needs the backend's price ledger:
 *
 * - its current price must equal the price shown (the ledger has caught up);
 * - its history must cover the whole 30-day window;
 * - the reference must be higher than the price shown.
 *
 * Otherwise the price is shown without any "was"/percentage claim.
 */
export function discountClaim(
  displayedAmount: number,
  reference: PriceReference | null | undefined
): DiscountClaim | null {
  if (
    !reference?.history_complete ||
    reference.current_amount === null ||
    reference.reference_price === null
  ) {
    return null
  }
  if (Math.abs(reference.current_amount - displayedAmount) >= 0.005) {
    return null
  }
  if (reference.reference_price <= displayedAmount) {
    return null
  }

  const percentage = Math.floor(
    ((reference.reference_price - displayedAmount) / reference.reference_price) * 100
  )
  if (percentage < 1) {
    return null
  }

  return { referenceAmount: reference.reference_price, percentage }
}

/**
 * The claim for a price as the storefront displays it. Only sale price lists
 * are announced as reductions; a changed base price is shown as it is.
 */
export function claimForPrice(
  price:
    | { price_type: string | null; calculated_price_number: number; variant_id: string }
    | null
    | undefined,
  references: PriceReference[] | undefined
): DiscountClaim | null {
  if (!price || price.price_type !== "sale") {
    return null
  }
  return discountClaim(
    price.calculated_price_number,
    references?.find((reference) => reference.variant_id === price.variant_id)
  )
}
