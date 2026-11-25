import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import type { MenuCategory } from "@lib/util/menu-categories"

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
    // The listing's default fields: they include the stock the card's
    // add-to-cart checks (vewao-clients#75); a `fields` here would replace them.
    queryParams: {
      category_id: [category.id, ...category.children.map((child) => child.id)],
    },
  })

  // A category without published products gets no rail.
  if (!pricedProducts?.length) {
    return null
  }

  return (
    <li className="content-container max-w-7xl" data-testid="category-rail">
      {/* The category's name as the section's heading, without a "view all" link (owner, 2026-11-25). */}
      <h2 className="mb-16 text-4xl leading-tight text-ui-fg-base small:text-6xl">{category.title}</h2>
      <div className="w-full">
        {/* 3rem between the cards and the scrollbar (the padding), 6rem under it (owner, 2026-11-25). */}
        <ul className="mb-24 flex overflow-x-auto gap-4 pb-12 small:scrollbar px-px1">
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
