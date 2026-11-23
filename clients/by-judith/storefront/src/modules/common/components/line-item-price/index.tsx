import { getPercentageDiff } from "@lib/util/get-precentage-diff"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemPrice = ({
  item,
  style = "default",
  currencyCode,
}: LineItemPriceProps) => {
  const { total, original_total } = item
  if (total == null) return <span>Cena není dostupná</span>

  const originalPrice = original_total ?? total
  const currentPrice = total
  const hasReducedPrice = currentPrice < originalPrice

  return (
    // One size for the struck and the current price, each on one line (owner, 2026-11-22).
    <div className="flex flex-col items-end text-base-regular text-ui-fg-subtle">
      <div className="flex flex-col items-end">
        {hasReducedPrice && (
          <>
            <span className="whitespace-nowrap">
              {style === "default" && (
                <span className="text-ui-fg-subtle">Původně: </span>
              )}
              <span
                className="line-through text-ui-fg-muted"
                data-testid="product-original-price"
              >
                {convertToLocale({
                  amount: originalPrice,
                  currency_code: currencyCode,
                })}
              </span>
            </span>
            {style === "default" && (
              <span className="text-ui-fg-interactive">
                -{getPercentageDiff(originalPrice, currentPrice || 0)}%
              </span>
            )}
          </>
        )}
        <span
          className={clx("text-base-regular whitespace-nowrap", {
            "text-ui-fg-interactive": hasReducedPrice,
          })}
          data-testid="product-price"
        >
          {convertToLocale({
            amount: currentPrice,
            currency_code: currencyCode,
          })}
        </span>
      </div>
    </div>
  )
}

export default LineItemPrice
