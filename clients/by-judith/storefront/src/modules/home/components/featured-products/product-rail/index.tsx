import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import type { MenuCategory } from "@lib/util/menu-categories"
import { Text } from "@medusajs/ui"
import { getTranslations } from "next-intl/server"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  category,
  region,
}: {
  category: MenuCategory
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      category_id: [category.id, ...category.children.map((child) => child.id)],
      fields: "*variants.calculated_price",
    },
  })

  // A category without published products gets no rail.
  if (!pricedProducts?.length) {
    return null
  }
  const t = await getTranslations("product")

  return (
    <li className="content-container max-w-7xl" data-testid="category-rail">
      <div className="flex justify-between mb-8">
        <Text className="txt-xlarge">{category.title}</Text>
        <InteractiveLink href={`/categories/${category.handle}`}>
          {t("viewAll")}
        </InteractiveLink>
      </div>
      <div className="w-full">
        <ul className="flex overflow-x-auto gap-4 pb-8 small:scrollbar px-px1">
          {pricedProducts &&
            pricedProducts.map((product) => (
              <li key={product.id} className="flex-shrink-0 w-64 small:w-96">
                <ProductPreview product={product} region={region} isFeatured />
              </li>
            ))}
        </ul>
      </div>
    </li>
  )
}
