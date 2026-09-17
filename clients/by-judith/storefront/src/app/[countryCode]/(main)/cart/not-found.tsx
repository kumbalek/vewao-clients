import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { useTranslations } from "next-intl"

import InteractiveLink from "@modules/common/components/interactive-link"

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  return {
    title: t("404Title"),
    description: t("404Description"),
  }
}

export default function NotFound() {
  const t = useTranslations("404")

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl text-ui-fg-base">{t("title")}</h1>
      <p className="text-small-regular text-ui-fg-base">{t("cartText")}</p>
      <InteractiveLink href="/">{t("link")}</InteractiveLink>
    </div>
  )
}
