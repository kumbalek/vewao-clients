import { listMenuCategories } from "@lib/data/categories"
import type { MenuCategory } from "@lib/util/menu-categories"

import DiamondHeroClient, { type DiamondSlide } from "./diamond-hero"
import type { Highlight } from "./regions"

/**
 * The first three slides, each lifting one tone of the diamond (owner,
 * 2026-11-25): acupuncture the red facets, the clinic the gold, the herbs the
 * green. Their texts come from the shop's categories where there is one, the
 * clinic's from the landing ("Snoubíme západ s východem").
 */
const FEATURED: {
  key: string
  title?: string
  category?: string
  description?: string
  href?: string
  cta?: string
  highlight: Highlight
}[] = [
  { key: "akupunktura", title: "Akupunktura", category: "vychodni-medicina", highlight: { tone: "red" } },
  {
    key: "klinika",
    title: "Klinika",
    description: "Snoubíme západ s východem",
    href: "/content/contact",
    cta: "Kontakt a otevírací doba",
    highlight: { tone: "gold" },
  },
  { key: "herbs", category: "herbs", highlight: { tone: "green" } },
]

/**
 * The e-shop's hero, prototype (owner, 2026-11-25): the logo's diamond built
 * from its facets in WebGL, with a carousel of the three slides beside it.
 */
export default async function DiamondHero() {
  const categories = await listMenuCategories().catch(() => [] as MenuCategory[])
  const byHandle = new Map(categories.map((category) => [category.handle, category]))

  const featured: DiamondSlide[] = FEATURED.map((slide) => {
    const category = slide.category ? byHandle.get(slide.category) : undefined
    return {
      key: slide.key,
      title: slide.title ?? category?.title ?? slide.key,
      description: slide.description ?? category?.subtitle ?? null,
      href: slide.href ?? (category ? `/categories/${category.handle}` : "/shop"),
      cta: slide.cta ?? null,
      highlight: slide.highlight,
    }
  })
  return <DiamondHeroClient slides={featured} />
}
