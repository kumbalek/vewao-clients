import { clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"

import { claimForPrice, type PriceReference } from "@lib/util/discount-claim"
import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
  priceReferences,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  priceReferences?: PriceReference[]
}) {
  const t = useTranslations("product")
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

  return (
    <div className="flex flex-col text-ui-fg-base">
      <span
        className={clx("text-2xl", {
          "text-ui-fg-interactive": !!claim,
        })}
      >
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
      {claim && (
        <>
          <p>
            <span className="text-ui-fg-subtle">{t("referencePrice")} </span>
            <span
              className="line-through"
              data-testid="reference-product-price"
              data-value={claim.referenceAmount}
            >
              {convertToLocale({
                amount: claim.referenceAmount,
                currency_code: selectedPrice.currency_code,
              })}
            </span>
          </p>
          <span
            className="text-ui-fg-interactive"
            data-testid="product-price-discount"
          >
            -{claim.percentage} %
          </span>
        </>
      )}
    </div>
  )
}
