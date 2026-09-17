import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Heading } from "@medusajs/ui"
import Help from "@modules/order/components/help"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  return {
    title: t("orderConfirmationTitle"),
    description: t("orderConfirmationDescription"),
  }
}

export default async function OrderConfirmedPage(props: Props) {
  const t = await getTranslations("confirm")

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            <span>{t("thankYou")}</span>
            <span>{t("orderSuccessful")}</span>
          </Heading>
          <p>{t("detailsSentToEmail")}</p>
          <Help />
        </div>
      </div>
    </div>
  )
}
