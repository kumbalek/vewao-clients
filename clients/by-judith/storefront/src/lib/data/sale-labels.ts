import "server-only"

import { sdk } from "@lib/config"
import { listCmsSales } from "@lib/cms/client"
import { catalogueRevalidate } from "@lib/util/catalogue-cache"
import { NO_ACTIVE_SALES, runningSaleLabels, toSaleLabels, type ActiveSales, type SaleLabel } from "@lib/util/sale-labels"
import { getCacheOptions } from "./cookies"

/**
 * The sales Medusa runs now (vewao-platform#49), on the catalogue's cache
 * window: ending a sale in admin removes its labels within that time. A
 * failure shows no labels rather than a label for a sale that may have ended.
 */
export async function listActiveSales(): Promise<ActiveSales> {
  try {
    const next = { ...(await getCacheOptions("sales")), revalidate: catalogueRevalidate() }
    const { promotions, price_lists } = await sdk.client.fetch<Partial<ActiveSales>>("/store/active-sales", {
      method: "GET",
      next,
    })
    return { promotions: promotions ?? [], price_lists: price_lists ?? [] }
  } catch (error) {
    console.error("Active sales could not be loaded", error)
    return NO_ACTIVE_SALES
  }
}

/** The labels of the sales running now, with the running sales themselves. */
export async function listRunningSaleLabels(): Promise<{ labels: SaleLabel[]; active: ActiveSales }> {
  const [docs, active] = await Promise.all([
    listCmsSales().catch((error) => {
      console.error("Sale labels could not be loaded", error)
      return []
    }),
    listActiveSales(),
  ])
  return { labels: runningSaleLabels(toSaleLabels(docs), active), active }
}
