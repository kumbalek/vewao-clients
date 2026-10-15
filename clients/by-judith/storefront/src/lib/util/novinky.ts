export type NewsItem = {
  slug: string
  title: string
  created_at: string
  published_at?: string | null
  metadata?: {
    perex?: string | null
    odkaz?: string | null
    platnost_do?: string | null
    poradi?: number | null
  } | null
}

export type NewsLink = { href: string; external: boolean } | null

/** `platnost_do` values must be plain ISO dates; anything else means no expiry. */
const PLATNOST_RE = /^\d{4}-\d{2}-\d{2}$/

/** "YYYY-MM-DD" of `now` in Europe/Prague (en-CA already formats ISO dates). */
export function pragueDate(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

/** Timestamp for newest-first sorting; an unparseable date sorts oldest. */
function timestamp(value: string | null | undefined): number {
  const parsed = value ? Date.parse(value) : NaN
  return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * Items still valid on `now` (Prague date within `platnost_do`, which is valid
 * through that whole day), pinned first by `poradi` ascending, then newest
 * first by `published_at ?? created_at`, ties by slug ascending.
 */
export function activeNews<T extends NewsItem>(
  items: readonly T[],
  now: Date
): T[] {
  const today = pragueDate(now)

  const valid = items.filter((item) => {
    const platnost = item.metadata?.platnost_do
    if (!platnost || !PLATNOST_RE.test(platnost)) return true
    return today <= platnost
  })

  return valid
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const poradiA = a.item.metadata?.poradi
      const poradiB = b.item.metadata?.poradi
      const pinnedA = typeof poradiA === "number" && Number.isFinite(poradiA)
      const pinnedB = typeof poradiB === "number" && Number.isFinite(poradiB)
      if (pinnedA !== pinnedB) return pinnedA ? -1 : 1
      if (pinnedA && pinnedB && poradiA !== poradiB) return poradiA - poradiB
      const byDate =
        timestamp(b.item.published_at ?? b.item.created_at) -
        timestamp(a.item.published_at ?? a.item.created_at)
      if (byDate !== 0) return byDate
      if (a.item.slug !== b.item.slug) {
        return a.item.slug < b.item.slug ? -1 : 1
      }
      return a.index - b.index
    })
    .map((entry) => entry.item)
}

/**
 * Where the item's card links: internal paths start with "/" (not "//"),
 * http(s) URLs are external, anything else is not linkable.
 */
export function newsLink(item: NewsItem): NewsLink {
  const href = item.metadata?.odkaz?.trim() ?? ""
  if (!href) return null
  // "/\host" is protocol-relative to browsers, like "//host".
  if (href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/\\")) {
    return { href, external: false }
  }
  if (/^https?:\/\//i.test(href)) {
    return { href, external: true }
  }
  return null
}
