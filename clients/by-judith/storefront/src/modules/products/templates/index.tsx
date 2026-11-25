import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import { productVoucherTitle } from "@lib/util/voucher"
import ProductActions from "@modules/products/components/product-actions"
import { VariantDiscountBoxes, VariantOptionsProvider } from "@modules/products/components/product-actions/variant-options"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import Breadcrumbs from "@modules/common/components/breadcrumbs"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import type { ProductTexts } from "@lib/cms/product-texts"
import type { ProductTier } from "@lib/util/product-tiers"
import type { StaticVariants as StaticVariantsData } from "@lib/util/static-variants"
import StaticVariants from "@modules/products/components/static-variants"
import { productCategoryPath } from "@lib/util/category-path"
import type { SaleLabel } from "@lib/util/sale-labels"
import SaleLabels from "@modules/common/components/sale-labels"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  /** Subtitle, description and tab texts from the CMS (vewao-clients#50). */
  texts: ProductTexts
  /** Volume discounts on this product (vewao-platform#45). */
  productTiers?: ProductTier[]
  /** Another product's option pills this product bundles (static variants). */
  staticVariants?: StaticVariantsData | null
  /** Labels of the running sales on the product's categories. */
  saleLabels?: SaleLabel[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  texts,
  productTiers = [],
  staticVariants,
  saleLabels = [],
}) => {
  const t = useTranslations("product")

  if (!product || !product.id) {
    return notFound()
  }

  const brPath = [
    {
      name: t("home"),
      href: "/",
    },
  ]

  // The category path, e.g. Herbs › Gold Edition (vewao-clients#67).
  for (const category of productCategoryPath(product.categories)) {
    brPath.push({ name: category.name, href: `/categories/${category.handle}` })
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[1440px] mt-6 pl-6">
        <Breadcrumbs path={brPath} />
      </div>
      <VariantOptionsProvider product={product} tiers={productTiers}>
      <div
        className="content-container flex flex-col small:flex-row small:justify-center items-center small:items-start py-6 relative"
        data-testid="product-container"
      >
        {/* Left, as on a product card (owner, 2026-11-25): the photo, the name, the price. */}
        <div className="flex flex-col small:sticky small:top-24 small:py-0 max-w-[420px] w-full pb-8">
          <ImageGallery images={product?.images || []} title={product.title} voucherTitle={productVoucherTitle(product)} />
          <div className="mt-3 flex flex-col items-start gap-y-2 px-4">
            <Heading level="h2" className="text-left text-3xl leading-10 text-ui-fg-base" data-testid="product-title">
              {product.title}
            </Heading>
            <Suspense fallback={<ProductActions part="price" disabled={true} product={product} region={region} />}>
              <ProductActionsWrapper part="price" id={product.id} region={region} withReferences={productTiers.length > 0} />
            </Suspense>
          </div>
        </div>
        {/* Right: the add-to-cart on top (with the choice a variant needs), then the
            sale boxes, then the description (owner, 2026-11-25). */}
        <div className="flex w-full flex-col gap-4 pb-8 small:max-w-[500px] small:pl-8">
          <Suspense fallback={<ProductActions part="buy" disabled={true} product={product} region={region} />}>
            <ProductActionsWrapper part="buy" id={product.id} region={region} withReferences={productTiers.length > 0} />
          </Suspense>
          <VariantDiscountBoxes />
          <SaleLabels labels={saleLabels} />
          {staticVariants && <StaticVariants variants={staticVariants} />}
          <ProductInfo texts={texts} />
          <ProductTabs texts={texts} />
        </div>
      </div>
      </VariantOptionsProvider>
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
