/**
 * Whether checkout needs delivery (vewao-clients#52). Gift vouchers have no
 * shipping profile, so Medusa marks their items `requires_shipping: false`
 * and completes a voucher-only cart without a shipping method
 * (vewao-platform#25). Unknown counts as needing delivery.
 */
type ShippingCart = {
  items?: { requires_shipping?: boolean | null }[] | null
  shipping_methods?: unknown[] | null
} | null | undefined

export function cartNeedsShipping(cart: ShippingCart): boolean {
  const items = cart?.items ?? []
  return items.length === 0 || items.some((item) => item.requires_shipping !== false)
}

/** The delivery step is done: a method is chosen, or nothing in the cart is delivered. */
export function deliveryDone(cart: ShippingCart): boolean {
  return !cartNeedsShipping(cart) || (cart?.shipping_methods?.length ?? 0) > 0
}
