import type { MenuCategory } from "@lib/util/menu-categories"

/**
 * Category names in the header search (owner, 2026-11-22). Medusa's product
 * search (`q`) reads a product's own texts only, so "Gold Edition" or
 * "Západní medicína" found nothing. A category whose name contains the query
 * (ignoring case and diacritics) is shown above the results, and its
 * products, with its subcategories', join them.
 */

/** Lower case without diacritics: "Západní" and "zapadni" compare equal. */
export function foldText(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("cs").trim()
}

export type FoundCategory = { id: string; handle: string; title: string; image: string | null; subtitle: string | null }

export function searchCategories(
  categories: MenuCategory[],
  query: string
): { matches: FoundCategory[]; ids: string[] } {
  const wanted = foldText(query)
  const matches: FoundCategory[] = []
  const ids: string[] = []
  if (wanted.length < 2) return { matches, ids }

  for (const top of categories) {
    if (foldText(top.title).includes(wanted)) {
      matches.push({ id: top.id, handle: top.handle, title: top.title, image: top.image, subtitle: top.subtitle })
      ids.push(top.id, ...top.children.map((child) => child.id))
      continue
    }
    for (const child of top.children) {
      if (foldText(child.title).includes(wanted)) {
        matches.push({ ...child, subtitle: null })
        ids.push(child.id)
      }
    }
  }
  return { matches, ids }
}
