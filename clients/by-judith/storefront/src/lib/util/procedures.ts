import type { Procedure } from "../../cms/payload-types"

/**
 * The clinic's procedures as the shop shows them (#43): categories, their
 * procedures and one level of sub-procedures, all at /<slug>. Pure, so the
 * menu, the pages and Ceník follow the same rules and can be tested alone.
 */

export type ProcedureImage = { url: string; alt: string | null; width?: number | null; height?: number | null }
export type PriceRow = { item: string | null; price: string }
export type ProcedureSection = NonNullable<Procedure["sections"]>[number]
export type Seo = { title: string | null; description: string | null }

type Page = {
  id: number
  slug: string
  /** Shop path without the country, e.g. /modelace-rtu. */
  href: string
  name: string
  /** H1: the page heading, else the menu name. */
  title: string
  perex: string | null
  image: ProcedureImage | null
  sections: ProcedureSection[]
  seo: Seo
}

export type CategoryEntry = Page & { menuDescription: string | null }

export type ProcedureEntry = Page & {
  categoryId: number | null
  parentId: number | null
  ctaLabel: string | null
  annotation: string | null
  annotationLink: string | null
  priceSummary: string | null
  duration: string | null
  /** Visible rows only. */
  priceRows: PriceRow[]
}

export type ProcedureBranch = { procedure: ProcedureEntry; children: ProcedureEntry[] }
export type CategoryBranch = { category: CategoryEntry; procedures: ProcedureBranch[] }

export const procedureHref = (slug: string) => `/${slug}`

/** Categories in menu order, each with its procedures and their sub-procedures, in menu order. */
export function procedureTree(categories: CategoryEntry[], procedures: ProcedureEntry[]): CategoryBranch[] {
  return categories.map((category) => ({
    category,
    procedures: procedures
      .filter((p) => p.parentId === null && p.categoryId === category.id)
      .map((procedure) => ({ procedure, children: procedures.filter((s) => s.parentId === procedure.id) })),
  }))
}

export type Located =
  | { kind: "category"; branch: CategoryBranch }
  | {
      kind: "procedure"
      category: CategoryEntry
      parent: ProcedureEntry | null
      procedure: ProcedureEntry
      children: ProcedureEntry[]
      /** The other procedures beside it: under the same parent, or in the same category. */
      siblings: ProcedureEntry[]
    }

/** The page at /<slug>: a category, a procedure or a sub-procedure. */
export function locate(tree: CategoryBranch[], slug: string): Located | null {
  for (const branch of tree) {
    if (branch.category.slug === slug) return { kind: "category", branch }
    for (const { procedure, children } of branch.procedures) {
      if (procedure.slug === slug) {
        const siblings = branch.procedures.map((b) => b.procedure).filter((p) => p.id !== procedure.id)
        return { kind: "procedure", category: branch.category, parent: null, procedure, children, siblings }
      }
      const sub = children.find((c) => c.slug === slug)
      if (sub) {
        return {
          kind: "procedure",
          category: branch.category,
          parent: procedure,
          procedure: sub,
          children: [],
          siblings: children.filter((c) => c.id !== sub.id),
        }
      }
    }
  }
  return null
}

/** Home → category → parent: the pages above one. */
export function breadcrumbs(located: Located): { name: string; href: string }[] {
  if (located.kind === "category") return []
  return [located.category, ...(located.parent ? [located.parent] : [])].map((p) => ({ name: p.name, href: p.href }))
}

export type MenuProcedure = { title: string; href: string; children: { title: string; href: string }[] }
export type MenuCategory = { title: string; description: string | null; href: string; procedures: MenuProcedure[] }

/** The header's Procedury menu. */
export function procedureMenu(tree: CategoryBranch[]): MenuCategory[] {
  return tree.map(({ category, procedures }) => ({
    title: category.name,
    description: category.menuDescription,
    href: category.href,
    procedures: procedures.map(({ procedure, children }) => ({
      title: procedure.name,
      href: procedure.href,
      children: children.map((c) => ({ title: c.name, href: c.href })),
    })),
  }))
}

export type PriceListEntry = { slug: string; name: string; href: string; rows: PriceRow[]; children: PriceListEntry[] }
export type PriceListSection = { slug: string; name: string; href: string; entries: PriceListEntry[] }

/** A procedure's Ceník rows: its visible rows, else its short price as one row. */
export function priceRowsOf(procedure: ProcedureEntry): PriceRow[] {
  if (procedure.priceRows.length) return procedure.priceRows
  return procedure.priceSummary ? [{ item: null, price: procedure.priceSummary }] : []
}

/** Ceník: every category with its priced procedures and sub-procedures, in menu order. */
export function priceList(tree: CategoryBranch[]): PriceListSection[] {
  const entry = (procedure: ProcedureEntry, children: PriceListEntry[]): PriceListEntry => ({
    slug: procedure.slug,
    name: procedure.name,
    href: procedure.href,
    rows: priceRowsOf(procedure),
    children,
  })
  return tree
    .map(({ category, procedures }) => ({
      slug: category.slug,
      name: category.name,
      href: category.href,
      entries: procedures
        .map(({ procedure, children }) =>
          entry(procedure, children.map((c) => entry(c, [])).filter((c) => c.rows.length))
        )
        .filter((e) => e.rows.length || e.children.length),
    }))
    .filter((section) => section.entries.length)
}
