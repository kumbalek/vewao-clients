import { clx } from "@medusajs/ui"
import Image from "next/image"
import { getTranslations } from "next-intl/server"

import { bookingPath } from "content/site"
import { getBaseURL } from "@lib/util/env"
import { breadcrumbs, type Located } from "@lib/util/procedures"
import EditLink from "@modules/cms/components/edit-link"
import Breadcrumbs from "@modules/common/components/breadcrumbs"
import { Placeholder } from "@modules/common/components/placeholder"
import ProcedureCard from "@modules/clinic/components/procedure-card"
import ProcedureSections from "@modules/clinic/components/procedure-sections"
import { ButtonLink, Card, Heading, MediaFrame, Section, Text } from "@modules/design-system"

type ProcedurePage = Extract<Located, { kind: "procedure" }>

/**
 * A procedure or sub-procedure (wireframe 03): its content beside a booking
 * box with the price, then its sub-procedures and the procedures beside it.
 */
export default async function ProcedureTemplate({
  page,
  countryCode,
  edit = false,
}: {
  page: ProcedurePage
  countryCode: string
  /** A CMS preview with edit links. */
  edit?: boolean
}) {
  const t = await getTranslations("procedures")
  const { procedure, children, siblings } = page
  const path = [{ name: t("home"), href: "/" }, ...breadcrumbs(page)]
  const prices = procedure.priceRows
  const facts = [
    { label: t("price"), value: procedure.priceSummary },
    { label: t("duration"), value: procedure.duration },
  ].filter((fact) => fact.value)
  // A pinned box taller than the screen would hide its lower rows until the
  // article ends; long price lists scroll with the page instead.
  const pinBox = prices.length <= 6
  const related = siblings.slice(0, 3)

  return (
    <>
      <BreadcrumbData path={[...path, { name: procedure.name, href: procedure.href }]} countryCode={countryCode} />
      <Section spacing="md" className="pb-0 small:pb-0">
        <Breadcrumbs path={path} />
      </Section>

      <Section spacing="md">
        <div className="grid items-start gap-10 small:grid-cols-[3fr_2fr] small:gap-16">
          <Card tone="outline" className={clx("small:order-last", pinBox && "small:sticky small:top-28")}>
            <Heading level={1} size="lg">
              {procedure.title}
            </Heading>
            {edit && (
              <div className="mt-4">
                <EditLink collection="procedures" id={procedure.id} label={`Upravit proceduru ${procedure.name}`} />
              </div>
            )}
            {facts.length > 0 && (
              <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-xs uppercase tracking-widest text-ink-muted">{fact.label}</dt>
                    <dd className="mt-1 text-xl text-ink">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="mt-8 flex flex-col items-center gap-3">
              <ButtonLink href={bookingPath} size="lg" fullWidth>
                {procedure.ctaLabel || t("bookProcedure")}
              </ButtonLink>
              <Placeholder compact className="text-sm">
                {t("voucher")}
              </Placeholder>
            </div>
            {prices.length > 0 && (
              <div className="mt-8">
                <Heading level={2} size="sm">
                  {t("priceList")}
                </Heading>
                <dl className="mt-2 divide-y divide-line text-sm" data-testid="price-list">
                  {prices.map((row, index) => (
                    <div key={index} className="flex justify-between gap-4 py-3">
                      <dt className="text-ink-subtle">{row.item ?? procedure.name}</dt>
                      <dd className="text-right text-ink">{row.price}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </Card>

          <div className="flex flex-col gap-10">
            {procedure.image && (
              <MediaFrame ratio="landscape">
                <Image
                  src={procedure.image.url}
                  alt={procedure.image.alt ?? ""}
                  fill
                  priority
                  sizes="(min-width: 1024px) 700px, 100vw"
                  className="object-cover"
                />
              </MediaFrame>
            )}
            {procedure.perex && (
              <Text size="lead" className="whitespace-pre-line" data-testid="procedure-perex">
                {procedure.perex}
              </Text>
            )}
            {procedure.sections.length > 0 && <ProcedureSections sections={procedure.sections} />}
          </div>
        </div>
      </Section>

      {children.length > 0 && (
        <Section spacing="md" aria-labelledby="procedures-offer">
          <Heading id="procedures-offer" level={2} size="lg">
            {t("offer")}
          </Heading>
          <ul className="mt-8 grid gap-x-6 gap-y-12 xsmall:grid-cols-2 small:grid-cols-3">
            {children.map((child) => (
              <li key={child.id}>
                <ProcedureCard procedure={child} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {related.length > 0 && (
        <Section spacing="lg" aria-labelledby="related-procedures">
          <Heading id="related-procedures" level={2} size="lg">
            {t("related")}
          </Heading>
          <ul className="mt-8 grid gap-x-6 gap-y-12 xsmall:grid-cols-2 small:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <ProcedureCard procedure={item} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )
}

/** The trail to this page for search engines (schema.org BreadcrumbList). */
function BreadcrumbData({ path, countryCode }: { path: { name: string; href: string }[]; countryCode: string }) {
  const base = `${getBaseURL().replace(/\/+$/, "")}/${countryCode}`
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: path.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${base}${item.href === "/" ? "" : item.href}`,
    })),
  }
  // JSON in a script element: "<" escaped so text cannot end the element.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}
