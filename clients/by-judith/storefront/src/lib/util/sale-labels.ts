/**
 * Sale labels (owner, 2026-11-22): the texts of a sale come from the CMS
 * ("Akce"), keyed by the code of a promotion or the title of a sale price
 * list. A label shows only while Medusa runs that sale (vewao-platform#49
 * `GET /store/active-sales`), so ending the sale in admin removes its labels.
 */

export type SaleLabel = {
  code: string
  label: string
  description: string | null
  /** Category handles; a label shows on these, their subcategories and their products. */
  categories: string[]
  showInCart: boolean
}

export type ActiveSales = { promotions: string[]; price_lists: string[] }

export const NO_ACTIVE_SALES: ActiveSales = { promotions: [], price_lists: [] }

type CmsSale = {
  code?: string | null
  label?: string | null
  description?: string | null
  categories?: (string | null)[] | null
  showInCart?: boolean | null
}

/** "herbs", "/categories/herbs" or " Herbs " all name the category herbs. */
export function categoryHandle(value: string): string {
  const parts = value.trim().toLowerCase().split("/").filter(Boolean)
  return parts[parts.length - 1] ?? ""
}

/** The CMS documents as labels; a document without a code or a label is left out. */
export function toSaleLabels(docs: ReadonlyArray<CmsSale | null | undefined>): SaleLabel[] {
  const labels: SaleLabel[] = []
  for (const doc of docs) {
    const code = doc?.code?.trim()
    const label = doc?.label?.trim()
    if (!code || !label) continue
    labels.push({
      code,
      label,
      description: doc?.description?.trim() || null,
      categories: Array.from(new Set((doc?.categories ?? []).map((c) => categoryHandle(c ?? "")).filter(Boolean))),
      showInCart: doc?.showInCart !== false,
    })
  }
  return labels
}

/** The labels whose sale runs now. */
export function runningSaleLabels(labels: SaleLabel[], active: ActiveSales): SaleLabel[] {
  const running = new Set([...active.promotions, ...active.price_lists])
  return labels.filter((label) => running.has(label.code))
}

type CategoryLike = { handle?: string | null; parent_category?: CategoryLike | null } | null | undefined

/** A category's handle and its parents' handles. */
export function categoryLineage(category: CategoryLike): string[] {
  const handles: string[] = []
  for (let c = category; c && handles.length < 10; c = c.parent_category) {
    if (c.handle) handles.push(c.handle.toLowerCase())
  }
  return handles
}

/** The labels shown for any of the given categories (and so their subcategories). */
export function saleLabelsForCategories(labels: SaleLabel[], categories: CategoryLike[]): SaleLabel[] {
  const handles = new Set(categories.flatMap(categoryLineage))
  return labels.filter((label) => label.categories.some((handle) => handles.has(handle)))
}

type CartLike = {
  promotions?: ({ code?: string | null } | null)[] | null
  items?: ({ unit_price?: number | null; compare_at_unit_price?: number | null } | null)[] | null
}

/**
 * The labels of the sales the cart actually gets: a promotion the cart
 * applies, or a running sale price list once an item carries a sale price
 * (Medusa then gives the line its pre-sale `compare_at_unit_price`).
 */
export function saleLabelsForCart(labels: SaleLabel[], active: ActiveSales, cart: CartLike | null | undefined): SaleLabel[] {
  const applied = new Set((cart?.promotions ?? []).map((p) => p?.code?.trim()).filter(Boolean))
  const onSalePrice = (cart?.items ?? []).some(
    (item) => item?.compare_at_unit_price != null && item.unit_price != null && item.compare_at_unit_price > item.unit_price
  )
  return labels.filter(
    (label) =>
      label.showInCart &&
      ((active.promotions.includes(label.code) && applied.has(label.code)) ||
        (active.price_lists.includes(label.code) && onSalePrice))
  )
}
