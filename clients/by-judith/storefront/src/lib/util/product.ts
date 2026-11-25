import { HttpTypes } from "@medusajs/types";

export const isSimpleProduct = (product: HttpTypes.StoreProduct): boolean => {
    return product.options?.length === 1 && product.options[0].values?.length === 1;
}

type StockLike = Pick<HttpTypes.StoreProductVariant, "manage_inventory" | "allow_backorder" | "inventory_quantity">

/** Can be bought now: stock is not tracked, backorders are allowed, or some is on hand. */
export const inStock = (variant: StockLike): boolean =>
    !variant.manage_inventory || !!variant.allow_backorder || (variant.inventory_quantity ?? 0) > 0

/**
 * What a product card's add-to-cart adds (vewao-clients#75): the only variant,
 * or null when the shopper has to choose one on the product page.
 */
export const cardVariant = (product: HttpTypes.StoreProduct): HttpTypes.StoreProductVariant | null =>
    product.variants?.length === 1 ? product.variants[0] ?? null : null
