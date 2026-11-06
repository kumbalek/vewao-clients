/** Presentation rules for clinic content: order and monograms. */

type Ordered = { title: string; metadata?: { poradi?: number | null } | null }

/** By the admin's "Pořadí" field; items without one follow, by title. */
export function byOrder<T extends Ordered>(items: T[]): T[] {
  const rank = (item: T) => item.metadata?.poradi ?? Number.POSITIVE_INFINITY
  return [...items].sort(
    (a, b) => rank(a) - rank(b) || a.title.localeCompare(b.title, "cs")
  )
}

/** The stored letter, else the first name's initial ("Mgr. Judita Halvová" → "J"). */
export function monogram(name: string, letter?: string | null): string {
  if (letter?.trim()) return letter.trim().charAt(0).toLocaleUpperCase("cs")
  const first = name.split(/\s+/).find((word) => word && !word.endsWith(".")) ?? name
  return first.charAt(0).toLocaleUpperCase("cs")
}
