import { Text, clx } from "@medusajs/ui"
import { getTranslations } from "next-intl/server"

import type { DiscountClaim } from "@lib/util/discount-claim"
import { convertToLocale } from "@lib/util/money"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({
  price,
  claim,
}: {
  price: VariantPrice
  claim: DiscountClaim | null
}) {
  if (!price) {
    return null
  }

  const t = await getTranslations("product")

  return (
    <>
      {claim && (
        <Text
          className="line-through text-ui-fg-muted"
          data-testid="original-price"
          title={t("referencePrice")}
        >
          {convertToLocale({
            amount: claim.referenceAmount,
            currency_code: price.currency_code,
          })}
        </Text>
      )}
      <Text
        className={clx("text-ui-fg-muted", {
          "text-ui-fg-interactive": !!claim,
        })}
        data-testid="price"
      >
        {price.calculated_price}
      </Text>
    </>
  )
}
