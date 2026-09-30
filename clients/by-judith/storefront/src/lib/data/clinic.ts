import "server-only"

import { pending, type ProcedureCategory as MenuCategory } from "content/site"
import {
  getContentItem,
  listContentItems,
  type ContentImage,
  type ContentItem,
  type ImageMetadata,
} from "@lib/data/content"
import { byOrder } from "@lib/util/clinic"

/**
 * Clinic content collections (see seed/import-clinic.ts): page texts, team,
 * procedure categories, procedures and FAQ.
 */

type Ordered = { poradi?: number | null }

export type Page = ContentItem<ImageMetadata & { perex?: string | null; gallery?: ContentImage[] }>
export type TeamMember = ContentItem<
  ImageMetadata & Ordered & { role?: string | null; kvalifikace?: string | null; pismeno?: string | null }
>
export type ProcedureCategory = ContentItem<ImageMetadata & Ordered & { perex?: string | null }>
export type Procedure = ContentItem<
  ImageMetadata &
    Ordered & {
      kategorie?: string | null
      perex?: string | null
      cena?: string | null
      delka?: string | null
      cenik?: string | null
      rezervace_url?: string | null
    }
>
export type Faq = ContentItem<Ordered & { kategorie?: string | null; procedura?: string | null }>

type Meta<T extends ContentItem<object>> = NonNullable<T["metadata"]>

export const getPage = (slug: string) => getContentItem<Meta<Page>>("stranky", slug)

export const listTeam = async () => byOrder(await listContentItems<Meta<TeamMember>>("tym"))

export const listProcedureCategories = async () =>
  byOrder(await listContentItems<Meta<ProcedureCategory>>("kategorie-procedur"))

export const getProcedureCategory = (slug: string) =>
  getContentItem<Meta<ProcedureCategory>>("kategorie-procedur", slug)

/** Procedures of one category, in admin order. */
export const listProcedures = async (category: string) =>
  byOrder(
    (await listContentItems<Meta<Procedure>>("procedury")).filter(
      (p) => p.metadata?.kategorie === category
    )
  )

export const getProcedure = (slug: string) => getContentItem<Meta<Procedure>>("procedury", slug)

/**
 * A category's questions. Without a procedure: only those for the whole
 * category; with one: those plus the procedure's own.
 */
export const listFaq = async (category: string, procedure?: string) =>
  byOrder(
    (await listContentItems<Meta<Faq>>("faq")).filter(
      (f) =>
        f.metadata?.kategorie === category &&
        (!f.metadata?.procedura || f.metadata.procedura === procedure)
    )
  )

export const procedureHref = (procedure: Procedure) =>
  `/procedury/${procedure.metadata?.kategorie}/${procedure.slug}`

/** The header's "Procedury" menu: categories with their procedures. */
export async function listProcedureMenu(): Promise<MenuCategory[]> {
  const [categories, procedures] = await Promise.all([
    listProcedureCategories(),
    listContentItems<Meta<Procedure>>("procedury"),
  ])
  return categories.map((category) => ({
    title: category.title,
    description: category.metadata?.perex || pending("krátký popis kategorie"),
    href: `/procedury/${category.slug}`,
    procedures: byOrder(procedures.filter((p) => p.metadata?.kategorie === category.slug)).map(
      (p) => ({ title: p.title, href: procedureHref(p) })
    ),
  }))
}
