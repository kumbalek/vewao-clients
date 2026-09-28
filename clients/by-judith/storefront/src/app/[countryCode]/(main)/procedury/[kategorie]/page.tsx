import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getProcedureCategory } from "@lib/data/clinic"
import { contentImage, teaser } from "@lib/data/content"
import ProcedureCategoryTemplate from "@modules/clinic/templates/procedure-category"

type Props = { params: Promise<{ kategorie: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { kategorie } = await props.params
  const category = await getProcedureCategory(kategorie)
  if (!category) return {}

  const image = contentImage(category)
  const description = teaser(category.metadata?.perex, category.body, 160)
  return {
    title: category.title,
    description,
    openGraph: {
      title: category.title,
      description,
      images: image ? [{ url: image.url, alt: image.alt ?? undefined }] : undefined,
    },
  }
}

export default async function ProcedureCategoryPage(props: Props) {
  const { kategorie } = await props.params
  const category = await getProcedureCategory(kategorie)
  if (!category) notFound()

  return <ProcedureCategoryTemplate category={category} />
}
