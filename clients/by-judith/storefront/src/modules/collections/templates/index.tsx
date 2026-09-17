import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"
import Breadcrumbs from "@modules/common/components/breadcrumbs"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}) {
  const t = useTranslations("product")
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="flex flex-col py-6 content-container">
      <div className="mb-4">
        <Breadcrumbs
          path={[
            {
              name: t("home"),
              href: "/",
            },
            {
              name: t("allProducts"),
              href: "/store",
            },
          ]}
        />
      </div>

      {/* <RefinementList sortBy={sort} /> */}
      <div className="w-full">
        <div className="mb-8 text-2xl ">
          <h1>{`${t("collection")} – ${collection.title}`}</h1>
        </div>
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={collection.products?.length}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
