import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { getPage } from "@lib/data/clinic"
import AboutTemplate from "@modules/clinic/templates/about"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about")
  return { title: t("title"), description: t("description") }
}

export default async function AboutPage() {
  const page = await getPage("o-nas")
  if (!page) notFound()

  return <AboutTemplate page={page} />
}
