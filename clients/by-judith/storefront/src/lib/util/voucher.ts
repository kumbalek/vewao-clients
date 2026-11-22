/**
 * Gift vouchers (vewao-clients#70): products of vewao-platform's voucher
 * product type (its VOUCHER_PRODUCT_TYPE, "Dárkový poukaz" by default). Their
 * image is the empty voucher; the shop writes the product's name on it.
 */
export const VOUCHER_PRODUCT_TYPE = "Dárkový poukaz"

type ProductLike = { title?: string | null; type?: { value?: string | null } | null }
type LineItemLike = {
  product_type?: string | null
  product_title?: string | null
  title?: string | null
  variant_title?: string | null
  variant?: { title?: string | null } | null
}

/** The name to write on a voucher product's image, or null for other products. */
export function productVoucherTitle(product: ProductLike | null | undefined): string | null {
  return product?.type?.value === VOUCHER_PRODUCT_TYPE ? product.title?.trim() || null : null
}

/**
 * Several variants at once (owner, 2026-11-22): a voucher whose variants differ
 * in one option, such as Ultherapy's areas. Each chosen variant is its own
 * cart line, so its own voucher.
 */
export function allowsSeveralVariants(
  product: (ProductLike & { options?: unknown[] | null; variants?: unknown[] | null }) | null | undefined
): boolean {
  return productVoucherTitle(product) !== null && product?.options?.length === 1 && (product.variants?.length ?? 0) > 1
}

/** The same for a cart or order line, from its product snapshot. */
export function itemVoucherTitle(item: LineItemLike | null | undefined): string | null {
  return item?.product_type === VOUCHER_PRODUCT_TYPE ? (item.product_title ?? item.title)?.trim() || null : null
}

/**
 * A voucher line's chosen variant, such as Ultherapy's area (vewao-clients#70),
 * so lines of the same product can be told apart; null when it says nothing
 * more than the product's name.
 */
export function itemVoucherVariant(item: LineItemLike | null | undefined): string | null {
  if (!itemVoucherTitle(item)) return null
  const variant = (item?.variant_title ?? item?.variant?.title)?.trim()
  return variant && variant !== item?.product_title?.trim() ? variant : null
}
