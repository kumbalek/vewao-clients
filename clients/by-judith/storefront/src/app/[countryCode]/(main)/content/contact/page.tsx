import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Heading } from "@medusajs/ui"
import Help from "@modules/order/components/help"
import { useTranslations } from "next-intl"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  return {
    title: t("contactTitle"),
    description: t("contactDescription"),
  }
}

export default function ContactPage(props: Props) {
  const t = useTranslations("contact")

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
            {t("title")}
          </Heading>
          <div className="font-sans">
            <div className="bg-zinc-50 max-w-4xl mx-auto p-6 sm:p-10 rounded-[3rem]  text-gray-800">
              {/* Header */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {/* Levý sloupec: Adresa a Otevírací doba */}
                <div className="space-y-8">
                  {/* Adresa */}
                  <div>
                    <h3 className="text-xl  text-gray-800 mb-3">Naše Adresa</h3>
                    <div className="text-gray-700 leading-relaxed">
                      <p>Beauty Body Clinic</p>
                      <p>Kosmická 19</p>
                      <p>149 00 Praha 4 - Háje</p>
                    </div>
                  </div>

                  {/* Otevírací doba */}
                  <div>
                    <h3 className="text-xl  text-gray-800 mb-3">
                      Otevírací doba
                    </h3>
                    <div className="text-gray-700">
                      <p>
                        <strong>Pondělí–Pátek:</strong> 10:00 – 18:00
                      </p>
                      <p className="mt-4 text-sm text-gray-600">
                        Přijímáme platby v hotovosti i kartou.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pravý sloupec: Kontaktní informace */}
                <div className="space-y-8">
                  {/* Recepce */}
                  <div>
                    <h3 className="text-xl  text-gray-800 mb-3">
                      Recepce, objednání konzultací
                    </h3>
                    <div className="space-y-3">
                      <p>
                        <a
                          href="tel:+420720980530"
                          className="text-[#85977b]  transition-colors duration-300"
                        >
                          +420 720 980 530
                        </a>
                      </p>
                      <p>
                        <a
                          href="mailto:info@bbclinic.cz"
                          className="text-[#85977b]  transition-colors duration-300"
                        >
                          info@bbclinic.cz
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Brand Manager */}
                  <div>
                    <h3 className="text-xl  text-gray-800 mb-3">
                      Brand Manager / Spolupráce
                    </h3>
                    <div className="space-y-3">
                      <p>
                        <a
                          href="tel:+420739510481"
                          className="text-[#85977b]  transition-colors duration-300"
                        >
                          +420 739 510 481
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Help hide="contact" />
        </div>
      </div>
    </div>
  )
}
