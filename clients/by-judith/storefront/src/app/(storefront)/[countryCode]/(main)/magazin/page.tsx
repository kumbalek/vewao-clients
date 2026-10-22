import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import MagazinOverview from "@modules/magazin/templates/magazin-overview"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("magazin")
  return { title: t("title"), description: t("description") }
}

export default async function MagazinPage(props: {
  searchParams: Promise<{ tag?: string | string[]; page?: string | string[] }>
}) {
  const searchParams = await props.searchParams
  const tag = [searchParams.tag].flat()[0]?.trim() || undefined
  const page = Number([searchParams.page].flat()[0] ?? 1)

  return <MagazinOverview tag={tag} page={page} />
}
