/**
 * How many seconds the shop may show catalogue data after a change in admin
 * (vewao-clients#65): products, prices, stock, categories, regions, and payment
 * and shipping options. Next's data cache keeps such a fetch this long; the
 * first request after that serves the cached copy once and refreshes it.
 *
 * Without a limit the data stayed until the next deploy: the starter's
 * `force-cache` fetches are tagged per visitor, and nothing ever revalidated the
 * shared entries. CATALOGUE_REVALIDATE_SECONDS overrides the default (the
 * Playwright run uses 1).
 */
export const DEFAULT_CATALOGUE_REVALIDATE = 60

export function catalogueRevalidate(env: Record<string, string | undefined> = process.env): number {
  const seconds = Number(env.CATALOGUE_REVALIDATE_SECONDS)
  return Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_CATALOGUE_REVALIDATE
}
