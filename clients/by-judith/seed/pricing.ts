/**
 * EUR prices for Slovakia (vewao-clients#45). Pure, so the dev seed, the
 * catalogue setup and the unit tests share it.
 */

/**
 * The herb lines (owner, 2026-11-22): the line as catalogue.json names it (the
 * legacy collection), its subcategory under Herbs, and its EUR price.
 */
export const HERB_LINES = [
  { line: "gold", title: "Gold Edition", handle: "gold-edition", eur: 75 },
  { line: "acute", title: "Acute", handle: "acute", eur: 24 },
] as const

/** The owner's EUR prices for the herb lines, by catalogue.json line. */
export const HERB_EUR_PRICES: Record<string, number> = Object.fromEntries(HERB_LINES.map((l) => [l.line, l.eur]))

/** The owner's rule for the other ranges (2026-11-22): EUR = Kč ÷ 25, rounded up to a whole euro (2 362 Kč → 95 €). */
export const eurFromCzk = (czk: number) => Math.ceil(czk / 25)

/** The same rule before the owner chose to round up: to the cent (2 362 Kč → 94,48 €). */
export const exactEurFromCzk = (czk: number) => Math.round(czk * 4) / 100

/**
 * The rounded EUR price to set on a variant, or undefined to leave it: only a
 * missing price or the earlier unrounded one is replaced, so a price set in
 * admin stays.
 */
export function roundedEurUpdate(currentEur: number | null | undefined, czk: number): number | undefined {
  const target = eurFromCzk(czk)
  if (currentEur == null) return target
  if (currentEur === target) return undefined
  return currentEur === exactEurFromCzk(czk) ? target : undefined
}

/** Placeholder EUR price: CZK at 25 Kč/€, up to a whole euro, minus 10 cents (1 890 Kč → 75,90 €). */
export const devEurPrice = (czk: number) => Math.ceil(czk / 25) - 0.1

/** The EUR price a new product gets: the owner's for a herb line, otherwise a placeholder. */
export const eurPriceFor = (line: string | null | undefined, czk: number) =>
  (line ? HERB_EUR_PRICES[line] : undefined) ?? devEurPrice(czk)

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
