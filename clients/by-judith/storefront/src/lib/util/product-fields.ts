/**
 * What product listings read. A caller's `fields` replaces it, so extend this
 * rather than restate it. Kept out of lib/data/products.ts: a "use server"
 * module may export async functions only.
 */
// Categories with their parents: the product page's breadcrumb, and the card's
// category link (vewao-clients#75).
export const PRODUCT_LIST_FIELDS =
  "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,*categories,*categories.parent_category"
