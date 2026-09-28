/** Presentation rules for clinic content: order, price lists, monograms. */

type Ordered = { title: string; metadata?: { poradi?: number | null } | null }

/** By the admin's "Pořadí" field; items without one follow, by title. */
export function byOrder<T extends Ordered>(items: T[]): T[] {
  const rank = (item: T) => item.metadata?.poradi ?? Number.POSITIVE_INFINITY
  return [...items].sort(
    (a, b) => rank(a) - rank(b) || a.title.localeCompare(b.title, "cs")
  )
}

export type PriceRow = { title: string; price: string }

/** The "Ceník" field: one row per line, "Název — Cena". */
export function parsePriceList(text: string | null | undefined): PriceRow[] {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const at = line.indexOf(" — ")
      return at === -1
        ? { title: line, price: "" }
        : { title: line.slice(0, at).trim(), price: line.slice(at + 3).trim() }
    })
}

/**
 * Split rendered HTML before its first h2: a category's intro, then its
 * sections ("Na co se zaměřujeme?"), which the page places below the procedures.
 */
export function splitAtFirstHeading(html: string): [string, string] {
  const at = html.search(/<h2[\s>]/i)
  return at === -1 ? [html, ""] : [html.slice(0, at), html.slice(at)]
}

/** The stored letter, else the first name's initial ("Mgr. Judita Halvová" → "J"). */
export function monogram(name: string, letter?: string | null): string {
  if (letter?.trim()) return letter.trim().charAt(0).toLocaleUpperCase("cs")
  const first = name.split(/\s+/).find((word) => word && !word.endsWith(".")) ?? name
  return first.charAt(0).toLocaleUpperCase("cs")
}
