import { Metadata } from "next"
import { notFound } from "next/navigation"

import { previewGrantFor } from "@lib/cms/client"
import { clip } from "@lib/data/content"
import { getProcedurePage } from "@lib/data/procedures"
import PreviewBar from "@modules/cms/components/preview-bar"
import ProcedureTemplate from "@modules/clinic/templates/procedure"
import ProcedureCategoryTemplate from "@modules/clinic/templates/procedure-category"
import { fullSiteOnly, isShopOnly } from "@lib/site-mode"

type Props = { params: Promise<{ countryCode: string; slug: string }> }

/**
 * Procedure categories, procedures and sub-procedures, all at /<slug> (#43).
 * The shop's own pages (cenik, magazin, …) are folders beside this one and
 * take precedence; the CMS refuses those names as slugs.
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  if (isShopOnly()) return {}
  const { slug } = await props.params
  const page = await getProcedurePage(slug).catch(() => null)
  if (!page) return {}

  const entry = page.kind === "category" ? page.branch.category : page.procedure
  const title = entry.seo.title || entry.title
  const description = entry.seo.description || (entry.perex ? clip(entry.perex, 160) : undefined)
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: entry.image ? [{ url: entry.image.url, alt: entry.image.alt ?? undefined }] : undefined,
    },
  }
}

export default async function ProcedurePage(props: Props) {
  fullSiteOnly()
  const { countryCode, slug } = await props.params
  const path = `/${countryCode}/${slug}`
  // A signed CMS preview of this page shows its latest draft.
  const grant = await previewGrantFor(path)
  const page = await getProcedurePage(slug, Boolean(grant))
  if (!page) notFound()
  const edit = grant?.mode === "edit"
  const editHref =
    page.kind === "category"
      ? `/admin/collections/procedure-categories/${page.branch.category.id}`
      : `/admin/collections/procedures/${page.procedure.id}`

  return (
    <>
      {page.kind === "category" ? (
        <ProcedureCategoryTemplate branch={page.branch} edit={edit} />
      ) : (
        <ProcedureTemplate page={page} countryCode={countryCode} edit={edit} />
      )}
      {grant && <PreviewBar path={path} editHref={editHref} edit={edit} />}
    </>
  )
}
