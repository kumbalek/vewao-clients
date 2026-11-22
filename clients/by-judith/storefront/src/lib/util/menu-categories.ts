/**
 * The shop's product categories for the menus (vewao-clients#64, #70): the
 * top-level ones in their admin order, each with its subcategories (DP
 * Dermaceuticals' ranges). Deeper levels are not shown. A category box shows
 * the category's description as its subtitle and the image whose URL is in
 * its metadata under `image`: Medusa 2.20 categories have no image field. The
 * category page's call to action is in its metadata too.
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

const isExternal = (url: string) => /^https?:\/\//i.test(url)
const isSitePath = (url: string) => /^\/(?!\/)/.test(url)
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "")

/** An absolute http(s) URL or a site path; anything else is not an image to show. */
export function categoryImage(metadata: StoreCategory["metadata"]): string | null {
  const url = text(metadata?.image)
  return isExternal(url) || isSitePath(url) ? url : null
}

export type CategoryCta = { label: string; href: string; external: boolean }

/**
 * The category page's call to action (vewao-clients#70): metadata `cta_label`
 * and `cta_url`, both required. The URL is an absolute http(s) URL or a shop
 * path; a path's leading country code is dropped, as links add the visitor's.
 */
export function categoryCta(metadata: StoreCategory["metadata"]): CategoryCta | null {
  const label = text(metadata?.cta_label)
  const url = text(metadata?.cta_url)
  if (!label || !url) return null
  if (isExternal(url)) return { label, href: url, external: true }
  if (isSitePath(url)) return { label, href: url.replace(/^\/(cz|sk)(?=\/|$)/i, "") || "/", external: false }
  return null
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
