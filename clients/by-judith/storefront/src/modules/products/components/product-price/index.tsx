
import { claimForPrice, type PriceReference } from "@lib/util/discount-claim"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

import SalePrice from "./sale-price"

export default function ProductPrice({
  product,
  variant,
  priceReferences,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  priceReferences?: PriceReference[]
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  // A reduction is announced only against the Omnibus 30-day lowest price.
  const claim = claimForPrice(selectedPrice, priceReferences)

  if (claim) {
    return (
      <SalePrice
        amount={selectedPrice.calculated_price_number}
        reference={claim.referenceAmount}
        percentage={claim.percentage}
        currencyCode={selectedPrice.currency_code}
      />
    )
  }

  return (
    <div className="flex flex-col text-ui-fg-base">
      <span className="text-2xl">
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
    </div>
  )
}
