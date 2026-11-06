import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { isShopOnly } from "@lib/site-mode"
import ShopFront from "@modules/home/templates/shop-front"
import HeroAnimation from "@modules/landing/components/hero-animation"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  // While only the e-shop is live (#47), the home page is the e-shop's front page.
  if (isShopOnly()) return { title: t("homeTitle"), description: t("shopDescription") }
  return { title: t("homeTitle"), description: t("homeDescription") }
}

/**
 * The clinic's landing page; the e-shop's front page is at /shop. While only
 * the e-shop is live (SITE_MODE=shop, #47), the home page is the e-shop's.
 */
export default async function Home(props: { params: Promise<{ countryCode: string }> }) {
  if (isShopOnly()) {
    const { countryCode } = await props.params
    return <ShopFront countryCode={countryCode} />
  }
  return <HeroAnimation />
}
