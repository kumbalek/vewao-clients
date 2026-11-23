import { Metadata } from "next"
import { ReactNode } from "react"
import { getTranslations } from "next-intl/server"
import { Heading } from "@medusajs/ui"
import Help from "@modules/order/components/help"
import { useTranslations } from "next-intl"

/**
 * "Doprava a platba", ported from the legacy shop (bbc-ng 3c88698,
 * 2026-11-15; vewao-clients#62). The text is the merchant's from the legacy
 * shop.
 */

type Option = {
  name: string
  description: ReactNode
}

const linkClassName = "text-[#85977b]"

const ComgateLink = () => (
  <a
    href="https://www.comgate.cz/cz/platebni-brana"
    target="_blank"
    rel="noopener noreferrer"
    className={linkClassName}
  >
    Platební brána Comgate
  </a>
)

const shippingOptions: Option[] = [
  {
    name: "Osobní odběr",
    description: "Osobní odběr na adrese Kosmická 19, 149 00 Praha 4 - Háje.",
  },
  {
    name: "PPL",
    description: (
      <>
        Odeslání pomocí přepravce{" "}
        <a
          href="https://www.ppl.cz/vyhledat-zasilku"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          PPL
        </a>
        . Doprava po Česku stojí 150 Kč, od 5.000 Kč je zdarma. Doprava na
        Slovensko stojí 10 €, od 220 € je zdarma.
      </>
    ),
  },
]

const paymentOptions: Option[] = [
  {
    name: "Bankovní převod",
    description: "Bankovním převodem na účet.",
  },
  {
    name: "Hotově",
    description:
      "Platba hotově nebo platební kartou na prodejně. Možné pouze při osobním odběru.",
  },
  {
    name: "Rychlé online platby",
    description: (
      <>
        Rychlá online platba pomocí bankovního tlačítka. Službu zajišťuje{" "}
        <ComgateLink />.
      </>
    ),
  },
  {
    name: "On-line platba kartou",
    description: (
      <>
        On-line platba platební kartou Visa nebo Mastercard. Službu zajišťuje{" "}
        <ComgateLink />.
      </>
    ),
  },
]

const OptionList = ({ options }: { options: Option[] }) => (
  <dl className="divide-y divide-gray-200">
    {options.map((option) => (
      <div
        key={option.name}
        className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 py-4 first:pt-0 last:pb-0"
      >
        <dt className="text-lg text-gray-800">{option.name}</dt>
        <dd className="sm:col-span-2 text-gray-700">{option.description}</dd>
      </div>
    ))}
  </dl>
)

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  return {
    title: t("shippingPaymentTitle"),
    description: t("shippingPaymentDescription"),
  }
}

export default function ShippingAndPaymentPage() {
  const t = useTranslations("shippingPayment")

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="shipping-payment-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            {t("title")}
          </Heading>
          <div className="bg-zinc-50 font-sans p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-lg text-gray-800 leading-relaxed">
              <div className="space-y-12">
                <section aria-labelledby="shipping-options">
                  <h2
                    id="shipping-options"
                    className="text-2xl mb-4 pb-2 border-b border-gray-200"
                  >
                    {t("shippingOptions")}
                  </h2>
                  <OptionList options={shippingOptions} />
                </section>

                <section aria-labelledby="payment-options">
                  <h2
                    id="payment-options"
                    className="text-2xl mb-4 pb-2 border-b border-gray-200"
                  >
                    {t("paymentOptions")}
                  </h2>
                  <OptionList options={paymentOptions} />
                </section>
              </div>
            </div>
          </div>
          <Help />
        </div>
      </div>
    </div>
  )
}
