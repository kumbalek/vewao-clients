import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Heading } from "@medusajs/ui"
import Help from "@modules/order/components/help"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ cart?: string }>
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  return {
    title: t("orderPendingTitle"),
    description: t("orderPendingDescription"),
  }
}

export default async function OrderPendingPage(props: Props) {
  const t = await getTranslations("confirm")
  const { countryCode } = await props.params
  const { cart } = await props.searchParams
  // Without the cart cookie (another browser, cleared cookies) the storefront
  // cannot check the payment. The gateway's webhook still completes a paid
  // order and the e-mail confirms it, so the page claims neither outcome.
  const cartKnown = cart !== "missing"

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-pending-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            {cartKnown ? t("pendingTitle") : t("pendingUnknown")}
          </Heading>
          {cartKnown && (
            <>
              <p>{t("pendingSentToEmail")}</p>
              {/* A plain link: prefetching this route would re-run completion. */}
              <a
                href={`/${countryCode}/checkout/payment-return`}
                className="w-fit underline text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                data-testid="check-payment-link"
              >
                {t("checkPayment")}
              </a>
            </>
          )}
          <Help />
        </div>
      </div>
    </div>
  )
}
