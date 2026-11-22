import { Suspense } from "react"
import { useTranslations } from "next-intl"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
// import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import Breadcrumbs from "@modules/common/components/breadcrumbs"
import type { MenuCategory } from "@lib/util/menu-categories"
import { searchCategories } from "@lib/util/category-search"
import CategoryBox from "@modules/layout/components/category-box"
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
  // Category names are searched too (vewao-clients#70).
  const found = query ? searchCategories(categories, query) : null

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
        {!!found?.matches.length && (
          <ul
            data-testid="search-categories"
            aria-label={tSearch("categories")}
            className="mb-8 grid grid-cols-1 gap-3 small:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] small:gap-4"
          >
            {found.matches.map((category) => (
              <li key={category.id}>
                <CategoryBox
                  href={`/categories/${category.handle}`}
                  title={category.title}
                  subtitle={category.subtitle}
                  image={category.image}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        )}
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            query={query}
            searchCategoryIds={found?.ids}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
