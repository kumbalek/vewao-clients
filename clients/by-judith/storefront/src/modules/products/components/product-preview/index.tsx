import { Text } from "@medusajs/ui"
import { listPriceReferences } from "@lib/data/price-history"
import { listProducts } from "@lib/data/products"
import { claimForPrice } from "@lib/util/discount-claim"
import { getProductPrice } from "@lib/util/get-product-price"
import { productVoucherTitle } from "@lib/util/voucher"
import { hasPriceRange } from "@lib/util/price-range"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })
  const claim =
    cheapestPrice?.price_type === "sale"
      ? claimForPrice(
          cheapestPrice,
          await listPriceReferences(product.id, region.id)
        )
      : null

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
          voucherTitle={productVoucherTitle(product)}
        />
        <div className="flex txt-compact-medium mt-4 items-start justify-between gap-4 px-8">
          <Text className="min-w-0 text-ui-fg-subtle" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex shrink-0">
            {cheapestPrice && (
              <PreviewPrice price={cheapestPrice} claim={claim} from={hasPriceRange(product)} />
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
