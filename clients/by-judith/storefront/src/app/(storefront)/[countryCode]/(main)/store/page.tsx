import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { permanentRedirect } from "next/navigation"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { listMenuCategories } from "@lib/data/categories"

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
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page } = searchParams
  // The header search submits ?q=; a repeated parameter arrives as an array.
  const query = [searchParams.q].flat()[0]?.trim() || undefined
  // Only search results live here: the categories replaced the list of all
  // products (owner, 2026-11-22), so the bare address leads to the e-shop's
  // front page, its category rails.
  if (!query) permanentRedirect(`/${params.countryCode}/shop`)
  const categories = await listMenuCategories().catch(() => [])

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      query={query}
      countryCode={params.countryCode}
      categories={categories}
    />
  )
}
