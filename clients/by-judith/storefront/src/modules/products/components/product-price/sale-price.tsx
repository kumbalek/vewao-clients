import { useTranslations } from "next-intl"

import { convertToLocale } from "@lib/util/money"
import { InfoTip } from "@modules/design-system"

/**
 * A sale on the product page (owner, 2026-11-22): the new price large, the
 * 30-day lowest price struck through under it, and an "i" whose tooltip says
 * what the struck price is and the discount. § 12a of the Czech consumer
 * protection act asks for the lowest price of the 30 days before the sale,
 * and the discount must be worked out from it: `reference` must be that price.
 */
export default function SalePrice({
  amount,
  reference,
  percentage,
  currencyCode,
  prefix,
}: {
  /** e.g. "Od" for the cheapest of several variants. */
  prefix?: string
  amount: number
  reference: number
  percentage: number
  currencyCode: string
}) {
  const t = useTranslations("product")
  const money = (value: number) => convertToLocale({ amount: value, currency_code: currencyCode })

  return (
    <div className="flex flex-col items-start text-ui-fg-base">
      <span className="text-2xl text-ui-fg-interactive">
        {prefix && <span data-testid="price-from">{prefix} </span>}
        <span data-testid="product-price" data-value={amount}>
          {money(amount)}
        </span>
      </span>
      <div className="flex items-center gap-1.5 text-ui-fg-subtle">
        <span className="line-through" data-testid="reference-product-price" data-value={reference}>
          {money(reference)}
        </span>
        <InfoTip label={t("priceInfo")}>
          {t("referencePrice")} {money(reference)}.{" "}
          {t("discountOf")} <span data-testid="product-price-discount">-{percentage} %</span>
        </InfoTip>
      </div>
    </div>
  )
}
