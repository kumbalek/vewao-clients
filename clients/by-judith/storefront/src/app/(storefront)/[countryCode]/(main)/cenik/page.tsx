import { Metadata } from "next"

import { listPriceList } from "@lib/data/procedures"
import type { PriceListEntry } from "@lib/util/procedures"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ButtonLink, Container, Heading, Section, Text } from "@modules/design-system"

export const metadata: Metadata = {
  title: "Ceník",
  description: "Ceny procedur kliniky Beauty Body Clinic.",
}

/**
 * Every procedure's prices, by category (vewao-clients#20, #43). Built from the
 * procedures' Cena tab in the CMS, so it never needs its own edits; a
 * sub-procedure's prices follow its parent procedure.
 */
export default async function PriceListPage() {
  const sections = await listPriceList()

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
                <LocalizedClientLink href={section.href} className="hover:underline">
                  {section.name}
                </LocalizedClientLink>
              </Heading>
              {section.entries.map((entry) => (
                <div key={entry.slug} className="flex flex-col gap-2">
                  <Heading level={3} size="sm">
                    <LocalizedClientLink href={entry.href} className="hover:underline">
                      {entry.name}
                    </LocalizedClientLink>
                  </Heading>
                  <Rows entry={entry} />
                  {entry.children.map((child) => (
                    <div key={child.slug} className="flex flex-col gap-2 border-l border-line pl-4">
                      <Heading level={4} size="sm">
                        <LocalizedClientLink href={child.href} className="hover:underline">
                          {child.name}
                        </LocalizedClientLink>
                      </Heading>
                      <Rows entry={child} />
                    </div>
                  ))}
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

function Rows({ entry }: { entry: PriceListEntry }) {
  if (!entry.rows.length) return null
  return (
    <dl className="divide-y divide-line text-sm">
      {entry.rows.map((row, index) => (
        <div key={index} className="flex justify-between gap-4 py-3">
          <dt className="text-ink-subtle">{row.item ?? entry.name}</dt>
          <dd className="text-right text-ink">{row.price}</dd>
        </div>
      ))}
    </dl>
  )
}
