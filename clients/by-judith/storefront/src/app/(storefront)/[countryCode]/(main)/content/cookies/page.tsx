import { Metadata } from "next"

import { contact } from "content/site"
import { consentCategories, gaMeasurementId } from "@lib/consent"
import { CookieSettingsButton } from "@modules/common/components/cookie-consent"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Container, Heading, Section, Text } from "@modules/design-system"

export const metadata: Metadata = {
  title: "Cookies",
  description: "Jaké cookies e-shop By Judith používá a jak nastavit souhlas.",
}

type CookieRow = { name: string; purpose: string; duration: string }

// What the storefront actually sets (src/lib/data/cookies.ts, proxy.ts,
// the kit's consent banner). Keep in step with the code.
const NECESSARY: CookieRow[] = [
  { name: "_medusa_cart_id", purpose: "Uchovává váš košík.", duration: "7 dní" },
  {
    name: "_medusa_cache_id",
    purpose: "Zajišťuje, že vidíte aktuální obsah košíku a stránek.",
    duration: "1 den",
  },
  {
    name: "_medusa_order_id",
    purpose: "Zobrazí potvrzení právě dokončené objednávky.",
    duration: "7 dní",
  },
  { name: "_medusa_jwt", purpose: "Udržuje přihlášení do zákaznického účtu.", duration: "7 dní" },
]

const CONSENT_COOKIE: CookieRow = {
  name: "vw_consent",
  purpose: "Pamatuje si vaši volbu cookies.",
  duration: "180 dní",
}

const ANALYTICS: CookieRow[] = [
  { name: "_ga", purpose: "Google Analytics: rozlišení návštěvníků.", duration: "2 roky" },
  { name: "_ga_<ID>", purpose: "Google Analytics: stav relace.", duration: "2 roky" },
]

function CookieTable({ caption, rows }: { caption: string; rows: CookieRow[] }) {
  return (
    <table className="w-full border-collapse text-left text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-line">
          <th scope="col" className="py-2 pr-4 font-normal text-ink-subtle">Název</th>
          <th scope="col" className="py-2 pr-4 font-normal text-ink-subtle">Účel</th>
          <th scope="col" className="py-2 font-normal text-ink-subtle">Platnost</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name} className="border-b border-line align-top">
            <td className="py-2 pr-4 font-mono text-xs">{row.name}</td>
            <td className="py-2 pr-4">{row.purpose}</td>
            <td className="py-2 whitespace-nowrap">{row.duration}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * Lists the cookies the shop sets. Generated from the configuration, so the
 * analytics section exists only while analytics is enabled. The wording needs
 * the merchant's approval (vewao-clients#22).
 */
export default function CookiesPage() {
  const consentInUse = consentCategories().length > 0
  const analytics = gaMeasurementId() !== null

  return (
    <Section spacing="md">
      <Container width="text" className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <Heading level={1} size="lg">
            Cookies
          </Heading>
          <Text tone="subtle">
            Cookies jsou malé soubory, které si web ukládá ve vašem prohlížeči. Nezbytné cookies
            potřebujeme, aby fungoval košík a objednávka; k nim souhlas nepotřebujeme.
            {analytics
              ? " Analytické cookies ukládáme jen tehdy, když s nimi souhlasíte."
              : " Jiné cookies nepoužíváme."}
          </Text>
          {consentInUse && (
            <Text tone="subtle">
              Souhlas můžete kdykoli změnit nebo odvolat:{" "}
              <CookieSettingsButton className="underline hover:text-ink" />.
            </Text>
          )}
        </div>

        <section aria-labelledby="cookies-necessary" className="flex flex-col gap-3">
          <Heading id="cookies-necessary" level={2} size="sm">
            Nezbytné
          </Heading>
          <CookieTable
            caption="Nezbytné cookies"
            rows={consentInUse ? [...NECESSARY, CONSENT_COOKIE] : NECESSARY}
          />
        </section>

        {analytics && (
          <section aria-labelledby="cookies-analytics" className="flex flex-col gap-3">
            <Heading id="cookies-analytics" level={2} size="sm">
              Analytické (se souhlasem)
            </Heading>
            <CookieTable caption="Analytické cookies" rows={ANALYTICS} />
            <Text size="sm" tone="subtle">
              Údaje zpracovává Google Ireland Limited. Odvoláním souhlasu analytické cookies
              smažeme a měření se přestane načítat.
            </Text>
          </section>
        )}

        <section aria-labelledby="cookies-third-party" className="flex flex-col gap-3">
          <Heading id="cookies-third-party" level={2} size="sm">
            Služby třetích stran
          </Heading>
          <Text tone="subtle">
            Písma načítáme ze služby Adobe Fonts; Adobe přitom získá vaši IP adresu a adresu
            stránky, cookies neukládá. Platební brána Comgate používá vlastní cookies na své doméně.
          </Text>
        </section>

        <Text size="sm" tone="subtle">
          Více o zpracování osobních údajů najdete v{" "}
          <LocalizedClientLink href="/content/privacy-policy" className="underline hover:text-ink">
            zásadách ochrany osobních údajů
          </LocalizedClientLink>
          . Dotazy posílejte na {contact.email}.
        </Text>
      </Container>
    </Section>
  )
}
