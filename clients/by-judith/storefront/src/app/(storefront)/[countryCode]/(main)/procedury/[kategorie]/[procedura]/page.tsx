import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getProcedure, getProcedureCategory } from "@lib/data/clinic"
import { contentImage, teaser } from "@lib/data/content"
import ProcedureTemplate from "@modules/clinic/templates/procedure"

type Props = { params: Promise<{ kategorie: string; procedura: string }> }

/** The procedure, only under the category it belongs to. */
async function load(props: Props) {
  const { kategorie, procedura } = await props.params
  const [category, procedure] = await Promise.all([
    getProcedureCategory(kategorie),
    getProcedure(procedura),
  ])
  return category && procedure?.metadata?.kategorie === category.slug
    ? { category, procedure }
    : null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const found = await load(props)
  if (!found) return {}

  const { procedure, category } = found
  const image = contentImage(procedure)
  const description = teaser(procedure.metadata?.perex, procedure.body, 160)
  return {
    title: `${procedure.title} – ${category.title}`,
    description,
    openGraph: {
      title: procedure.title,
      description,
      images: image ? [{ url: image.url, alt: image.alt ?? undefined }] : undefined,
    },
  }
}

export default async function ProcedurePage(props: Props) {
  const found = await load(props)
  if (!found) notFound()

  return <ProcedureTemplate procedure={found.procedure} category={found.category} />
}
