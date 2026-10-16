import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { listCollections } from "@lib/data/collections"

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  return {
    title: t("storeTitle"),
    description: t("storeDescription"),
  }
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    q?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page } = searchParams
  // The header search submits ?q=; a repeated parameter arrives as an array.
  const query = [searchParams.q].flat()[0]?.trim() || undefined

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      query={query}
      countryCode={params.countryCode}
      collections={collections}
    />
  )
}
