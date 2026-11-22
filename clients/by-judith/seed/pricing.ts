/**
 * EUR prices for Slovakia (vewao-clients#45). Pure, so the dev seed, the
 * catalogue setup and the unit tests share it.
 */

/** Owner's EUR prices for the herb lines, by collection handle (2026-11-22). */
export const HERB_EUR_PRICES: Record<string, number> = { gold: 75, acute: 24 }

/** The owner's rule for the other ranges (2026-11-22): EUR = Kč ÷ 25, to the cent (760 Kč → 30,40 €). */
export const eurFromCzk = (czk: number) => Math.round(czk * 4) / 100

/** Placeholder EUR price: CZK at 25 Kč/€, up to a whole euro, minus 10 cents (1 890 Kč → 75,90 €). */
export const devEurPrice = (czk: number) => Math.ceil(czk / 25) - 0.1

/** The EUR price a new product gets: the owner's for a herb line, otherwise a placeholder. */
export const eurPriceFor = (collection: string | null | undefined, czk: number) =>
  (collection ? HERB_EUR_PRICES[collection] : undefined) ?? devEurPrice(czk)

/**
 * The owner's EUR price to set on a variant, or undefined to leave it: only a
 * missing price or the dev placeholder is replaced, so a price set in admin
 * stays.
 */
export function ownerEurPriceUpdate(
  currentEur: number | null | undefined,
  czk: number,
  ownerEur: number
): number | undefined {
  if (currentEur == null) return ownerEur
  if (currentEur === ownerEur) return undefined
  return currentEur === devEurPrice(czk) ? ownerEur : undefined
}
