/** The owner's decisions on top of the old shop's DP snapshot, shared by the catalogue and texts scripts. */

/**
 * The owner's corrections to the old shop's DP titles (2026-11-22), by the
 * snapshot's handle. "CBD VISSSAGE" is DP Dermaceuticals' own spelling and stays.
 */
export const DP_TITLE_FIXES: Record<string, { title: string; handle: string }> = {
  "antioxidant-coctail-50ml": { title: "ANTIOXIDANT COCKTAIL™ 50ML", handle: "antioxidant-cocktail-50ml" },
  "antioxidant-coctail-30ml": { title: "ANTIOXIDANT COCKTAIL™ 30ML", handle: "antioxidant-cocktail-30ml" },
  "dermapem-home-jehlickove-naplne": {
    title: "Dermapen HOME™ jehličkové náplně",
    handle: "dermapen-home-jehlickove-naplne",
  },
}

/** Products the owner files in fewer DP subcategories than the old shop did (2026-11-22). */
export const DP_ONLY_IN: Record<string, string[]> = { "cbd-uber-calm-balm-30-ml": ["cbd-kolekce"] }

/** The handle a snapshot product has in the new shop. */
export const dpHandle = (snapshotHandle: string) => DP_TITLE_FIXES[snapshotHandle]?.handle ?? snapshotHandle
