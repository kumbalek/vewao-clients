/** Magazine listing rules: filtering, the featured article, paging, related reads. */

export const MAGAZIN_PAGE_SIZE = 12

type Tagged = { slug: string; tags?: { value: string }[] | null }

const hasTag = (article: Tagged, tag: string) => !!article.tags?.some((t) => t.value === tag)

/** Distinct tags in first-seen order; articles arrive newest first. */
export function articleTags(articles: Tagged[]): string[] {
  return Array.from(new Set(articles.flatMap((a) => a.tags?.map((t) => t.value) ?? [])))
}

/**
 * Without a tag the newest article is featured above the grid on page 1 and
 * never repeated in the grid. The page number is clamped to the valid range.
 */
export function selectArticles<T extends Tagged>(
  articles: T[],
  { tag, page = 1 }: { tag?: string; page?: number }
) {
  const matching = tag ? articles.filter((a) => hasTag(a, tag)) : articles
  const featured = tag ? null : matching[0] ?? null
  const grid = featured ? matching.slice(1) : matching
  const pageCount = Math.max(1, Math.ceil(grid.length / MAGAZIN_PAGE_SIZE))
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), pageCount)

  return {
    featured: current === 1 ? featured : null,
    items: grid.slice((current - 1) * MAGAZIN_PAGE_SIZE, current * MAGAZIN_PAGE_SIZE),
    page: current,
    pageCount,
    total: matching.length,
  }
}

/** Articles sharing a tag first, then the newest others. */
export function relatedArticles<T extends Tagged>(articles: T[], current: Tagged, count = 3): T[] {
  const others = articles.filter((a) => a.slug !== current.slug)
  const tags = current.tags?.map((t) => t.value) ?? []
  const sameTag = others.filter((a) => tags.some((tag) => hasTag(a, tag)))
  return [...sameTag, ...others.filter((a) => !sameTag.includes(a))].slice(0, count)
}

/** Tags are stored lower-case ("atopický ekzém"); display them sentence-case. */
export const tagLabel = (value: string) => value.charAt(0).toLocaleUpperCase("cs") + value.slice(1)
