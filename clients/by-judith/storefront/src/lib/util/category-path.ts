/**
 * A product's place in the catalogue for its breadcrumb (vewao-clients#67):
 * its most specific category, after that category's parent, e.g. Herbs › Gold
 * Edition. A product in several subcategories shows the first one.
 */

export type CategoryCrumb = { name: string; handle: string }

type ProductCategory = {
  name: string
  handle: string
  parent_category?: { name: string; handle: string } | null
} | null

export function productCategoryPath(categories: ProductCategory[] | null | undefined): CategoryCrumb[] {
  const list = (categories ?? []).filter((category): category is NonNullable<ProductCategory> => Boolean(category))
  const category = list.find((c) => c.parent_category) ?? list[0]
  if (!category) return []
  const crumb = ({ name, handle }: { name: string; handle: string }) => ({ name, handle })
  return category.parent_category ? [crumb(category.parent_category), crumb(category)] : [crumb(category)]
}
