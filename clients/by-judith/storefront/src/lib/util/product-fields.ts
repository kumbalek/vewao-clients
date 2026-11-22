/**
 * What product listings read. A caller's `fields` replaces it, so extend this
 * rather than restate it. Kept out of lib/data/products.ts: a "use server"
 * module may export async functions only.
 */
export const PRODUCT_LIST_FIELDS = "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags"
