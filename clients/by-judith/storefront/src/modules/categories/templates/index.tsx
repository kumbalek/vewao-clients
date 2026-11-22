import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

import { categoryImage } from "@lib/util/menu-categories"
import CategoryBox from "@modules/layout/components/category-box"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  // Subcategories in admin order; the page lists their products too (vewao-clients#67).
  const children = [...(category.category_children ?? [])].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
  const categoryIds = [category.id, ...children.map((child) => child.id)]

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      {/* <RefinementList sortBy={sort} data-testid="sort-by-container" /> */}
      <div className="w-full">
        <div className="flex flex-row mb-8 text-2xl  gap-4">
          {parents &&
            parents.map((parent) => (
              <span key={parent.id} className="text-ui-fg-subtle">
                <LocalizedClientLink
                  className="mr-4 hover:text-black"
                  href={`/categories/${parent.handle}`}
                  data-testid="sort-by-link"
                >
                  {parent.name}
                </LocalizedClientLink>
                /
              </span>
            ))}
          <h1 data-testid="category-page-title">{category.name}</h1>
        </div>
        {category.description && (
          <div className="mb-8 text-base-regular">
            <p>{category.description}</p>
          </div>
        )}
        {children.length > 0 && (
          // The subcategories as category boxes with their subtitles (vewao-clients#70):
          // a column on a phone, a wrapping row from `small` up, as in the Shop menu.
          <ul
            data-testid="subcategories"
            className="mb-8 grid grid-cols-1 gap-3 small:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] small:gap-4"
          >
            {children.map((child) => (
              <li key={child.id}>
                <CategoryBox
                  href={`/categories/${child.handle}`}
                  title={child.name}
                  subtitle={child.description?.trim() || null}
                  image={categoryImage(child.metadata)}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        )}
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryIds={categoryIds}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
