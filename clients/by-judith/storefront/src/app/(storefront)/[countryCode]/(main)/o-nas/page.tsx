import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { getPage } from "@lib/data/clinic"
import AboutTemplate from "@modules/clinic/templates/about"
import { fullSiteOnly, isShopOnly } from "@lib/site-mode"

export async function generateMetadata(): Promise<Metadata> {
  if (isShopOnly()) return {}
  const t = await getTranslations("about")
  return { title: t("title"), description: t("description") }
}

export default async function AboutPage() {
  fullSiteOnly()
  const page = await getPage("o-nas")
  if (!page) notFound()

  return <AboutTemplate page={page} />
}
