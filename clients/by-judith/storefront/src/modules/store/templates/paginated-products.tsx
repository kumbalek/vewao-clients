import { getTranslations } from "next-intl/server"

import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { ArrowLink, Text } from "@modules/design-system"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
  q?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  query,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  /** Full-text product search, passed to Medusa as `q`. */
  query?: string
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (query) {
    queryParams["q"] = query
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  const filteredProducts = products.filter((product) => {
    // Check if ANY variant in this product matches the hidden ID
    const isGiftProduct = product.variants?.some(
      (variant) =>
        variant.id === process.env.NEXT_PUBLIC_GIFT_PACKAGING_VARIANT_ID
    )

    // Return true to KEEP the product if it is NOT the gift product
    return !isGiftProduct
  })

  if (query && filteredProducts.length === 0) {
    const [t, tLayout] = await Promise.all([
      getTranslations("search"),
      getTranslations("layout"),
    ])

    return (
      <div className="flex flex-col items-start gap-4 py-12" data-testid="search-empty">
        <Text tone="subtle">{t("empty", { query })}</Text>
        <ArrowLink href="/store">{tLayout("allProducts")}</ArrowLink>
      </div>
    )
  }

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {filteredProducts.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview product={p} region={region} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
