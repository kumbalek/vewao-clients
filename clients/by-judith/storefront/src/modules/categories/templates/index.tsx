import { notFound } from "next/navigation"
import { useTranslations } from "next-intl"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import Breadcrumbs from "@modules/common/components/breadcrumbs"
import { HttpTypes } from "@medusajs/types"

import { clx } from "@medusajs/ui"

import { categoryCta, categoryImage } from "@lib/util/menu-categories"
import { ButtonLink, buttonClasses } from "@modules/design-system"
import CategoryBox from "@modules/layout/components/category-box"
import SaleLabels from "@modules/common/components/sale-labels"
import type { SaleLabel } from "@lib/util/sale-labels"

const ctaPlacement = "shrink-0 self-start small:self-center"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  saleLabels = [],
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  /** Labels of the running sales on this category or its parents. */
  saleLabels?: SaleLabel[]
}) {
  const t = useTranslations("product")
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

  // The product page's breadcrumbs (vewao-clients#70): Hlavní stránka › parent
  // categories. A top-level category shows the home link alone, so the title
  // sits at the same height on every category page.
  const brPath = [
    { name: t("home"), href: "/" },
    ...[...parents].reverse().map((parent) => ({ name: parent.name, href: `/categories/${parent.handle}` })),
  ]

  // Subcategories in admin order; the page lists their products too (vewao-clients#67).
  const children = [...(category.category_children ?? [])].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
  const categoryIds = [category.id, ...children.map((child) => child.id)]
  const cta = categoryCta(category.metadata)

  return (
    <div className="flex flex-col items-center">
    <div className="w-full max-w-[1440px] mt-6 pl-6" data-testid="category-breadcrumbs">
      <Breadcrumbs path={brPath} />
    </div>
    <div
      className="flex w-full flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      {/* <RefinementList sortBy={sort} data-testid="sort-by-container" /> */}
      <div className="w-full">
        {/* The title with its subtitle close under it; the category's call to action
            beside them from `small` up, under them on a phone (vewao-clients#70). The
            title is as large as the home page's category headings (owner, 2026-11-25). */}
        <div className="mb-8 flex flex-col gap-4 small:flex-row small:items-center small:justify-between small:gap-8">
          <div className="flex min-w-0 flex-col gap-2">
            {/* The running sales' labels beside the title, at its top (owner, 2026-11-22). */}
            <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
              <h1 data-testid="category-page-title" className="text-4xl leading-tight small:text-6xl">
                {category.name}
              </h1>
              <SaleLabels labels={saleLabels} variant="chip" className="pt-0.5" />
            </div>
            {category.description && (
              <p data-testid="category-description" className="text-base-regular">
                {category.description}
              </p>
            )}
          </div>
          {cta &&
            (cta.external ? (
              <a href={cta.href} className={clx(buttonClasses({ size: "lg" }), ctaPlacement)} data-testid="category-cta">
                {cta.label}
              </a>
            ) : (
              <ButtonLink href={cta.href} size="lg" className={ctaPlacement} data-testid="category-cta">
                {cta.label}
              </ButtonLink>
            ))}
        </div>
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
    </div>
  )
}
