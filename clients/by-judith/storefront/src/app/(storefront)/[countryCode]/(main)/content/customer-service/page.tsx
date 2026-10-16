import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Heading } from "@medusajs/ui"
import Help from "@modules/order/components/help"
import { useTranslations } from "next-intl"
import * as Accordion from "@radix-ui/react-accordion"
import UnderlineLink from "@modules/common/components/interactive-link"

const MorphingTrigger = () => {
  return (
    <div className="text-grey-90 hover:bg-grey-5 active:bg-grey-5 active:text-violet-60 focus:border-violet-60 disabled:text-grey-30 bg-transparent disabled:bg-transparent rounded-[3rem] group relative p-[6px]">
      <div className="h-5 w-5">
        <span className="bg-grey-50 rounded-circle group-radix-state-open:rotate-90 absolute inset-y-[31.75%] left-[48%] right-1/2 w-[1.5px] duration-300" />
        <span className="bg-grey-50 rounded-circle group-radix-state-open:rotate-90 group-radix-state-open:left-1/2 group-radix-state-open:right-1/2 absolute inset-x-[31.75%] top-[48%] bottom-1/2 h-[1.5px] duration-300" />
      </div>
    </div>
  )
}

const faqItems = [
  {
    question: "Jakou formou jsou byliny v tabletách zpracovány?",
    answer:
      "Jedná se o granuláty, které jsou vyrobeny z extraktů bylin, případně z konkrétních částí rostlin.",
  },
  {
    question: "Pro koho jsou bylinné tablety vhodné?",
    answer:
      "Pro všechny od 12 let. V případě mladších dětí je možné tablety rozdrtit a upravit množství po individuální konzultaci s naším terapeutem. Těhotné a kojící ženy by měly jednotlivé směsi konzultovat s TCM terapeutem s ohledem na složení.",
  },
  {
    question:
      "Nevyberu si, je možné objednat tablety přímo na míru mým požadavkům?",
    answer:
      "Ano, samozřejmě. Je možné připravit jak tablety, tak silnější bylinné odvary po individuální konzultaci přímo na míru vašim problémům.",
  },
  {
    question: "Co dělat když zapomenu tablety užít?",
    answer:
      "Vynechanou dávku užijte až ráno nebo večer, ideálně nalačno, nebo půl hodiny před jídlem či hodinu po jídle.",
  },
  {
    question: "Na jak dlouho jsou jednotlivá balení?",
    answer:
      "Tablety řady Acute jsou na 7 až 10 dní a doporučuje se je využívat i po odeznění příznaků respiračních onemocnění. Tablety řady Golden jsou na 30 dní užívání.",
  },
  {
    question: "Je vhodné užívat tablety delší dobu?",
    answer:
      "Akutní tablety (řada Acute) je vhodné užívat po dobu 7 až 10 dní, poté je dobré stav konzultovat s fytoterapeutem nebo odborníkem na TCM. Tablety ze zlaté řady (Golden) je možné užívat delší dobu, běžně se doporučuje 3 měsíční kúra, kterou lze po pauze opakovat.",
  },
  {
    question: "Čím je vhodné tablety zapít?",
    answer: "Ideálně vlažnou vodou nebo neslazeným čajem.",
  },
  {
    question: "Mohu tablety půlit, drtit?",
    answer:
      "Tablety je možné rozdrtit na prášek a zamíchat do jogurtu, vlažného čaje, případně i do ovocné šťávy.",
  },
  {
    question:
      "Mohu tablety kombinovat s jinými potravinovými doplňky případně léky?",
    answer:
      "Kombinace čínských bylinných tablet s jinými léky nebo doplňky stravy je možná, ale vyžaduje opatrnost a ideálně konzultaci s odborníkem TCM (případně lékařem nebo lékárníkem), protože interakce nelze vyloučit.",
  },
]

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  return {
    title: t("customerServiceTitle"),
    description: t("customerServiceDescription"),
  }
}

export default function CustomerServicePage() {
  const t = useTranslations("customerService")

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
          <ul className="gap-y-2 flex flex-col">
            <li>
              <UnderlineLink href="/content/terms-of-use">
                {t("termsLink")}
              </UnderlineLink>
            </li>
            <li>
              <UnderlineLink href="/content/privacy-policy">
                {t("privacyLink")}
              </UnderlineLink>
            </li>
          </ul>
          <div className="my-12">
            <h2 className="text-2xl  mb-6 pb-3 -b ">Často kladené dotazy</h2>
            <Accordion.Root
              type="single"
              defaultValue="item-0"
              collapsible
              className="w-full space-y-4"
            >
              {faqItems.map((item, index) => (
                <Accordion.Item
                  key={`item-${index}`}
                  value={`item-${index}`}
                  className="border-b last:border-b-0"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="flex justify-between items-center w-full py-4 text-left text-xl text-black hover:text-gray-800 focus:outline-none focus-visible:ring focus-visible:ring-pink-500 focus-visible:ring-opacity-75 group">
                      <span>{item.question}</span>
                      <MorphingTrigger />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden text-gray-700 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                    <div className="pb-4 pt-2">
                      <p>{item.answer}</p>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
          <div>
            <div className="max-w-4xl mx-auto bg-zinc-50 p-6 sm:p-10 rounded-[3rem] ">
              {/* Header */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                {/* Shipping Options */}
                <section>
                  <h2 className="text-2xl  mb-6 pb-3 -b ">Možnosti dopravy</h2>
                  <div className="space-y-6">
                    {/* Personal Pickup */}
                    <div>
                      <h3 className=" text-lg  mb-1">Osobní odběr</h3>
                      <p className="">
                        Osobní odběr na adrese Kosmická 19, 149 00 Praha 4 -
                        Háje.
                      </p>
                    </div>

                    {/* PPL */}
                    <div>
                      <h3 className=" text-lg  mb-1">PPL</h3>
                      <p className="">
                        Odeslání pomocí přepravce PPL, cena za odeslání je 150
                        Kč. Při nákupu nad 5.000 Kč je doprava zdarma.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Payment Options */}
                <section>
                  <h2 className="text-2xl  mb-6 pb-3 -b ">Možnosti platby</h2>
                  <div className="space-y-6">
                    {/* Cash */}
                    <div>
                      <h3 className=" text-lg  mb-1">Hotově</h3>
                      <p className="">
                        Platba hotově nebo platební kartou na prodejně. Možné
                        pouze při osobním odběru.
                      </p>
                    </div>

                    {/* Fast Online Payments */}
                    <div>
                      <h3 className=" text-lg  mb-1">Rychlé online platby</h3>
                      <p className="">
                        Rychlá online platba pomocí bankovního tlačítka. Službu
                        zajišťuje Platební brána Comgate.
                      </p>
                    </div>

                    {/* Online Card Payment */}
                    <div>
                      <h3 className=" text-lg  mb-1">On-line platba kartou</h3>
                      <p className="">
                        On-line platba platební kartou Visa nebo Mastercard.
                        Službu zajišťuje Platební brána Comgate.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
          <Help hide="service" />
        </div>
      </div>
    </div>
  )
}
