import { Metadata } from "next"

import { listAllProcedures, listProcedureCategories } from "@lib/data/clinic"
import { priceListSections } from "@lib/util/clinic"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ButtonLink, Container, Heading, Section, Text } from "@modules/design-system"

export const metadata: Metadata = {
  title: "Ceník",
  description: "Ceny procedur kliniky Beauty Body Clinic.",
}

/**
 * Every procedure's price list, by category (vewao-clients#20). Built from the
 * procedures' "Ceník" field in admin → Obsah, so it never needs its own edits.
 */
export default async function PriceListPage() {
  const [categories, procedures] = await Promise.all([
    listProcedureCategories(),
    listAllProcedures(),
  ])
  const sections = priceListSections(categories, procedures)

  return (
    <Section spacing="md">
      <Container width="text" className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <Heading level={1} size="lg">
            Ceník
          </Heading>
          <Text tone="subtle">
            Ceny procedur kliniky. Podrobnosti najdete u každé procedury; na termín se objednáte
            přes rezervaci.
          </Text>
        </div>

        {sections.length === 0 ? (
          <Text tone="subtle" data-testid="price-list-empty">
            Ceník právě připravujeme.
          </Text>
        ) : (
          sections.map((section) => (
            <section
              key={section.slug}
              aria-labelledby={`cenik-${section.slug}`}
              className="flex flex-col gap-6"
              data-testid="price-list-section"
            >
              <Heading id={`cenik-${section.slug}`} level={2} size="md">
                {section.title}
              </Heading>
              {section.procedures.map((procedure) => (
                <div key={procedure.slug} className="flex flex-col gap-2">
                  <Heading level={3} size="sm">
                    <LocalizedClientLink href={procedure.href} className="hover:underline">
                      {procedure.title}
                    </LocalizedClientLink>
                  </Heading>
                  <dl className="divide-y divide-line text-sm">
                    {procedure.rows.map((row) => (
                      <div key={row.title} className="flex justify-between gap-4 py-3">
                        <dt className="text-ink-subtle">{row.title}</dt>
                        <dd className="text-right text-ink">{row.price}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </section>
          ))
        )}

        <div>
          <ButtonLink href="/content/contact">Rezervovat</ButtonLink>
        </div>
      </Container>
    </Section>
  )
}
