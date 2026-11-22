/**
 * The shop's product categories for the menus (vewao-clients#64): the
 * top-level ones in their admin order, each with its subcategories (DP
 * Dermaceuticals' ranges). Deeper levels are not shown.
 */

export type MenuCategoryLink = { id: string; handle: string; title: string }
export type MenuCategory = MenuCategoryLink & { children: MenuCategoryLink[] }

type StoreCategory = {
  id: string
  handle: string
  name: string
  rank?: number | null
  parent_category_id?: string | null
}

const byRank = (a: StoreCategory, b: StoreCategory) =>
  (a.rank ?? 0) - (b.rank ?? 0) || a.name.localeCompare(b.name, "cs")

const link = ({ id, handle, name }: StoreCategory): MenuCategoryLink => ({ id, handle, title: name })

export function menuCategories(categories: StoreCategory[]): MenuCategory[] {
  return categories
    .filter((category) => !category.parent_category_id)
    .sort(byRank)
    .map((top) => ({
      ...link(top),
      children: categories
        .filter((category) => category.parent_category_id === top.id)
        .sort(byRank)
        .map(link),
    }))
}
