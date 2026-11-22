import { Text, clx } from "@medusajs/ui"
import { getTranslations } from "next-intl/server"

import type { DiscountClaim } from "@lib/util/discount-claim"
import { convertToLocale } from "@lib/util/money"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({
  price,
  claim,
  from = false,
}: {
  price: VariantPrice
  claim: DiscountClaim | null
  /** The cheapest of variants that differ in price: "Od …". */
  from?: boolean
}) {
  if (!price) {
    return null
  }

  const t = await getTranslations("product")

  // Each price on one line; on sale the new price above the struck one, as
  // on the product page (owner, 2026-11-22).
  return (
    <div className="flex flex-col items-end">
      <Text
        className={clx("whitespace-nowrap text-ui-fg-muted", {
          "text-ui-fg-interactive": !!claim,
        })}
        data-testid="price"
      >
        {from && `${t("priceFrom")} `}
        {price.calculated_price}
      </Text>
      {claim && (
        <Text
          className="whitespace-nowrap line-through text-ui-fg-muted"
          data-testid="original-price"
          title={t("referencePrice")}
        >
          {convertToLocale({
            amount: claim.referenceAmount,
            currency_code: price.currency_code,
          })}
        </Text>
      )}
    </div>
  )
}
