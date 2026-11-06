import "server-only"

import { pending, type ProcedureCategory as MenuCategory } from "content/site"
import {
  cmsMediaUrl,
  getCmsProcedureDraft,
  listCmsProcedureDocs,
  type CmsMedia,
  type CmsProcedure,
  type CmsProcedureCategory,
} from "@lib/cms/client"
import {
  locate,
  priceList,
  procedureHref,
  procedureMenu,
  procedureTree,
  type CategoryEntry,
  type Located,
  type ProcedureEntry,
  type ProcedureImage,
} from "@lib/util/procedures"

/** Procedure categories, procedures and sub-procedures from the Payload CMS (#43). */

type Ref = number | { id: number } | null | undefined
const refId = (value: Ref) => (value && typeof value === "object" ? value.id : value) ?? null

const image = (media: CmsMedia | number | null | undefined): ProcedureImage | null =>
  media && typeof media === "object"
    ? { url: cmsMediaUrl(media), alt: media.alt || null, width: media.width, height: media.height }
    : null

const page = (doc: CmsProcedureCategory | CmsProcedure) => ({
  id: doc.id,
  slug: doc.slug,
  href: procedureHref(doc.slug),
  name: doc.name,
  title: doc.title || doc.name,
  perex: doc.perex || null,
  image: image(doc.image as CmsMedia | number | null | undefined),
  sections: doc.sections ?? [],
  seo: { title: doc.seo?.title || null, description: doc.seo?.description || null },
})

const toCategory = (doc: CmsProcedureCategory): CategoryEntry => ({
  ...page(doc),
  menuDescription: doc.menuDescription || null,
})

const toProcedure = (doc: CmsProcedure): ProcedureEntry => ({
  ...page(doc),
  categoryId: refId(doc.category as Ref),
  parentId: refId(doc.parent as Ref),
  ctaLabel: doc.ctaLabel || null,
  annotation: doc.annotation || null,
  annotationLink: doc.annotationLink || null,
  priceSummary: doc.priceSummary || null,
  duration: doc.duration || null,
  priceRows: (doc.priceRows ?? []).filter((row) => !row.hidden).map((row) => ({ item: row.item || null, price: row.price })),
})

async function publishedEntries() {
  const { categories, procedures } = await listCmsProcedureDocs()
  return { categories: categories.map(toCategory), procedures: procedures.map(toProcedure) }
}

/** Puts `entry` in place of its published version, or adds a never-published one. */
function withDraft<T extends { id: number }>(entries: T[], entry: T): T[] {
  return entries.some((e) => e.id === entry.id) ? entries.map((e) => (e.id === entry.id ? entry : e)) : [...entries, entry]
}

/**
 * The page at /<slug>. Inside a preview grant for it, its latest draft; the
 * menu, siblings and sub-procedures around it stay published.
 */
export async function getProcedurePage(slug: string, draft = false): Promise<Located | null> {
  let { categories, procedures } = await publishedEntries()
  if (draft) {
    const found = await getCmsProcedureDraft(slug)
    if (found?.collection === "procedure-categories") categories = withDraft(categories, toCategory(found.doc))
    if (found?.collection === "procedures") procedures = withDraft(procedures, toProcedure(found.doc))
  }
  return locate(procedureTree(categories, procedures), slug)
}

/** The header's Procedury menu; empty if the CMS cannot be reached. */
export async function listProcedureMenu(): Promise<MenuCategory[]> {
  try {
    const { categories, procedures } = await publishedEntries()
    return procedureMenu(procedureTree(categories, procedures)).map((category) => ({
      ...category,
      description: category.description || pending("krátký popis kategorie"),
    }))
  } catch (error) {
    console.error("Procedure menu could not be loaded", error)
    return []
  }
}

/** Ceník: categories with their priced procedures; empty if the CMS cannot be reached. */
export async function listPriceList() {
  try {
    const { categories, procedures } = await publishedEntries()
    return priceList(procedureTree(categories, procedures))
  } catch (error) {
    console.error("Ceník could not be loaded", error)
    return []
  }
}
