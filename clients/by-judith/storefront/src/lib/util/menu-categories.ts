/**
 * The shop's product categories for the menus (vewao-clients#64, #70): the
 * top-level ones in their admin order, each with its subcategories (DP
 * Dermaceuticals' ranges). Deeper levels are not shown. A category box shows
 * the category's description as its subtitle and the image whose URL is in
 * its metadata under `image`: Medusa 2.20 categories have no image field.
 */

export type MenuCategoryLink = { id: string; handle: string; title: string; image: string | null }
export type MenuCategory = MenuCategoryLink & { subtitle: string | null; children: MenuCategoryLink[] }

type StoreCategory = {
  id: string
  handle: string
  name: string
  rank?: number | null
  parent_category_id?: string | null
  description?: string | null
  metadata?: Record<string, unknown> | null
}

/** An absolute http(s) URL or a site path; anything else is not an image to show. */
export function categoryImage(metadata: StoreCategory["metadata"]): string | null {
  const value = metadata?.image
  if (typeof value !== "string") return null
  const url = value.trim()
  return /^https?:\/\//i.test(url) || /^\/(?!\/)/.test(url) ? url : null
}

const byRank = (a: StoreCategory, b: StoreCategory) =>
  (a.rank ?? 0) - (b.rank ?? 0) || a.name.localeCompare(b.name, "cs")

const link = ({ id, handle, name, metadata }: StoreCategory): MenuCategoryLink => ({
  id,
  handle,
  title: name,
  image: categoryImage(metadata),
})

export function menuCategories(categories: StoreCategory[]): MenuCategory[] {
  return categories
    .filter((category) => !category.parent_category_id)
    .sort(byRank)
    .map((top) => ({
      ...link(top),
      subtitle: top.description?.trim() || null,
      children: categories
        .filter((category) => category.parent_category_id === top.id)
        .sort(byRank)
        .map(link),
    }))
}
