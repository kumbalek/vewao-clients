import { clx } from "@medusajs/ui"
import Image from "next/image"
import { getTranslations } from "next-intl/server"

import { bookingPath } from "content/site"
import { listFaq, listProcedures, type Procedure, type ProcedureCategory } from "@lib/data/clinic"
import { contentImage } from "@lib/data/content"
import { parsePriceList } from "@lib/util/clinic"
import Breadcrumbs from "@modules/common/components/breadcrumbs"
import { Placeholder } from "@modules/common/components/placeholder"
import { RichText } from "@modules/common/components/rich-text"
import { ButtonLink, Card, Heading, MediaFrame, Section, Text } from "@modules/design-system"
import FaqList from "@modules/clinic/components/faq-list"
import ProcedureCard from "@modules/clinic/components/procedure-card"

/**
 * Procedure detail (wireframe 03): description beside a booking box with the
 * price, then the sections the source has no content for yet, the category's
 * FAQ and related procedures.
 */
export default async function ProcedureTemplate({
  procedure,
  category,
}: {
  procedure: Procedure
  category: ProcedureCategory
}) {
  const t = await getTranslations("procedures")
  const [siblings, faq] = await Promise.all([
    listProcedures(category.slug),
    listFaq(category.slug, procedure.slug),
  ])
  const related = siblings.filter((p) => p.slug !== procedure.slug).slice(0, 3)
  const image = contentImage(procedure)
  const prices = parsePriceList(procedure.metadata?.cenik)
  const facts = [
    { label: t("price"), value: procedure.metadata?.cena },
    { label: t("duration"), value: procedure.metadata?.delka },
  ].filter((fact) => fact.value)
  // A pinned box taller than the screen would hide its lower rows until the
  // article ends; long price lists scroll with the page instead.
  const pinBox = prices.length <= 6

  return (
    <>
      <Section spacing="md" className="pb-0 small:pb-0">
        <Breadcrumbs
          path={[
            { name: t("home"), href: "/" },
            { name: category.title, href: `/procedury/${category.slug}` },
          ]}
        />
      </Section>

      <Section spacing="md">
        <div className="grid items-start gap-10 small:grid-cols-[3fr_2fr] small:gap-16">
          <Card
            tone="outline"
            className={clx("small:order-last", pinBox && "small:sticky small:top-28")}
          >
            <Heading level={1} size="lg">
              {procedure.title}
            </Heading>
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
                {t("bookProcedure")}
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
                  {prices.map((row) => (
                    <div key={row.title} className="flex justify-between gap-4 py-3">
                      <dt className="text-ink-subtle">{row.title}</dt>
                      <dd className="text-right text-ink">{row.price}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </Card>

          <div className="flex flex-col gap-10">
            {image && (
              <MediaFrame ratio="landscape">
                <Image
                  src={image.url}
                  alt={image.alt ?? ""}
                  fill
                  priority
                  sizes="(min-width: 1024px) 700px, 100vw"
                  className="object-cover"
                />
              </MediaFrame>
            )}
            {procedure.body_html && <RichText html={procedure.body_html} data-testid="procedure-body" />}
          </div>
        </div>
      </Section>

      <Section spacing="md" className="pt-0 small:pt-0">
        <ul className="grid gap-6 small:grid-cols-3">
          {[t("benefits"), t("expect"), t("therapist")].map((title) => (
            <li key={title}>
              <Card className="h-full">
                <Heading level={2} size="md">
                  {title}
                </Heading>
                <Text size="sm" tone="subtle" className="mt-3">
                  <Placeholder>{title.toLocaleLowerCase("cs")}</Placeholder>
                </Text>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      {faq.length > 0 && (
        <Section spacing="md" width="text">
          <FaqList items={faq} />
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
