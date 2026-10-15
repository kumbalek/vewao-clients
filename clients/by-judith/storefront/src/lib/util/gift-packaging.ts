/**
 * Handle of the gift-packaging product, kept from the legacy shop so migrated
 * data matches. Its _Discountable_ switch is off in admin: promotions neither
 * discount it nor count it towards quantity tiers.
 */
export const GIFT_PACKAGING_HANDLE = "darkove-baleni"

/** Whether a cart line is the gift packaging rather than a product. */
export function isGiftPackaging(item: { product_handle?: string | null }): boolean {
  return item.product_handle === GIFT_PACKAGING_HANDLE
}
