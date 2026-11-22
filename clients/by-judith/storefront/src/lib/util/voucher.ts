/**
 * Gift vouchers (vewao-clients#70): products of vewao-platform's voucher
 * product type (its VOUCHER_PRODUCT_TYPE, "Dárkový poukaz" by default). Their
 * image is the empty voucher; the shop writes the product's name on it.
 */
export const VOUCHER_PRODUCT_TYPE = "Dárkový poukaz"

type ProductLike = { title?: string | null; type?: { value?: string | null } | null }
type LineItemLike = { product_type?: string | null; product_title?: string | null; title?: string | null }

/** The name to write on a voucher product's image, or null for other products. */
export function productVoucherTitle(product: ProductLike | null | undefined): string | null {
  return product?.type?.value === VOUCHER_PRODUCT_TYPE ? product.title?.trim() || null : null
}

/** The same for a cart or order line, from its product snapshot. */
export function itemVoucherTitle(item: LineItemLike | null | undefined): string | null {
  return item?.product_type === VOUCHER_PRODUCT_TYPE ? (item.product_title ?? item.title)?.trim() || null : null
}
