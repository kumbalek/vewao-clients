import { Suspense } from "react"
import { useTranslations } from "next-intl"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
// import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import Breadcrumbs from "@modules/common/components/breadcrumbs"
import type { MenuCategory } from "@lib/util/menu-categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  query,
  countryCode,
  categories,
}: {
  sortBy?: SortOptions
  page?: string
  query?: string
  countryCode: string
  /** The top-level categories, linked above the product list. */
  categories: MenuCategory[]
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const t = useTranslations("product")
  const tSearch = useTranslations("search")

  return (
    <div
      className="flex flex-col py-6 content-container"
      data-testid="category-container"
    >
      <div className="mb-4">
        <Breadcrumbs
          path={[
            {
              name: t("home"),
              href: "/",
            },
          ]}
        />
      </div>
      {/* <RefinementList sortBy={sort} /> */}
      <div className="w-full">
        <div className="mb-8 text-2xl flex flex-col justify-between small:flex-row small:items-center">
          <h1 data-testid="store-page-title">
            {query ? tSearch("title", { query }) : t("allProducts")}
          </h1>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1 small:gap-2 text-xl" data-testid="store-categories">
              {`${t("category")}: `}
              {categories.map((c, index) => (
                <span className="text-[#85977b]" key={c.handle}>
                  <LocalizedClientLink href={`/categories/${c.handle}`}>
                    {c.title}
                  </LocalizedClientLink>
                  {index !== categories.length - 1 && (
                    <span className="ml-1 small:ml-2">{"|"}</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            query={query}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
