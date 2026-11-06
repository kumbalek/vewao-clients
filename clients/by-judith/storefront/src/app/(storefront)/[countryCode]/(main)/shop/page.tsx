import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import ShopFront from "@modules/home/templates/shop-front"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return { title: t("shopTitle"), description: t("shopDescription") }
}

/** The e-shop's front page: the site's home page before the clinic landing. */
export default async function ShopPage(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
  return <ShopFront countryCode={countryCode} />
}
