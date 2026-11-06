type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

/** Whole crowns; cents for euros (vewao-clients#45) and other currencies. */
const fractionDigits = (currency: string) => (currency.toLowerCase() === "czk" ? 0 : 2)

/**
 * A price in the shop's style: dots between thousands and one space before
 * the currency ("1.890 Kč", "1.234,50 €").
 */
export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "cs-CZ",
}: ConvertToLocaleParams) => {
  if (!currency_code?.trim()) return amount.toString()
  const digits = fractionDigits(currency_code)
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency_code,
    minimumFractionDigits: minimumFractionDigits ?? digits,
    maximumFractionDigits: maximumFractionDigits ?? Math.max(digits, minimumFractionDigits ?? 0),
  })
    .formatToParts(amount)
    .map((part) =>
      part.type === "group" ? "." : part.type === "literal" && /^\s+$/.test(part.value) ? " " : part.value
    )
    .join("")
}
