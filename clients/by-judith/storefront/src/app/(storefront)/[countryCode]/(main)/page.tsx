import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import HeroAnimation from "@modules/landing/components/hero-animation"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return { title: t("homeTitle"), description: t("homeDescription") }
}

/**
 * The clinic's landing page. The e-shop's front page, which used to live here,
 * is at /shop.
 */
export default function Home() {
  return <HeroAnimation />
}
