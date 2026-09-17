import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import Breadcrumbs from "@modules/common/components/breadcrumbs"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
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
    {
      name: t("allProducts"),
      href: "/store",
    },
  ]

  if (product.collection) {
    brPath.push({
      name: `${t("collection")} – ${product.collection.title}`,
      href: `/collections/${product.collection.handle}`,
    })
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[1440px] mt-6 pl-6">
        <Breadcrumbs path={brPath} />
      </div>
      <div
        className="content-container flex flex-col small:flex-row small:justify-center items-center small:items-start py-6 relative"
        data-testid="product-container"
      >
        <div className="flex flex-col small:sticky small:top-24 small:py-0 max-w-[420px] w-full pb-8 gap-y-1">
          <ImageGallery images={product?.images || []} />
          {/* <ProductOnboardingCta /> */}
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>
        </div>
        <div className="flex flex-col items-center gap-4 block w-full small:max-w-[500px] small:pl-8 relative">
          <ProductInfo product={product} />
          <ProductTabs product={product} />
        </div>
      </div>
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
