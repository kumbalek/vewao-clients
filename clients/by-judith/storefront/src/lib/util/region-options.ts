/** Delivery countries the shop can switch between, each with its region's currency (#45). */

export type RegionOption = { countryCode: string; label: string; currencySymbol: string }

type Region = { currency_code: string; countries?: ({ iso_2?: string | null } | null)[] | null }

/** "Kč" for CZK, "€" for EUR, as the shop writes prices. */
export const currencySymbol = (code: string) =>
  new Intl.NumberFormat("cs-CZ", { style: "currency", currency: code })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? code.toUpperCase()

/** The regions' countries the shop names, in the order of `labels`. */
export function regionOptions(regions: Region[], labels: Record<string, string>): RegionOption[] {
  const order = Object.keys(labels)
  return regions
    .flatMap((region) =>
      (region.countries ?? []).flatMap((country) =>
        country?.iso_2 && labels[country.iso_2]
          ? [{ countryCode: country.iso_2, label: labels[country.iso_2], currencySymbol: currencySymbol(region.currency_code) }]
          : []
      )
    )
    .sort((a, b) => order.indexOf(a.countryCode) - order.indexOf(b.countryCode))
}
