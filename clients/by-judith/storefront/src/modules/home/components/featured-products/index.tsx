import { HttpTypes } from "@medusajs/types"

import type { MenuCategory } from "@lib/util/menu-categories"
import ProductRail from "@modules/home/components/featured-products/product-rail"

/** A rail per top-level category, its subcategories' products included; empty ones render nothing. */
export default async function FeaturedProducts({
  categories,
  region,
}: {
  categories: MenuCategory[]
  region: HttpTypes.StoreRegion
}) {
  return categories.map((category) => <ProductRail key={category.id} category={category} region={region} />)
}
