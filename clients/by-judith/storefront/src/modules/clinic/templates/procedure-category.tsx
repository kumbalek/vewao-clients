import Image from "next/image"
import { getTranslations } from "next-intl/server"

import { listFaq, listProcedures, type ProcedureCategory } from "@lib/data/clinic"
import { contentImage } from "@lib/data/content"
import { splitAtFirstHeading } from "@lib/util/clinic"
import { RichText } from "@modules/common/components/rich-text"
import { Heading, MediaFrame, Section, Text } from "@modules/design-system"
import FaqList from "@modules/clinic/components/faq-list"
import ProcedureCard from "@modules/clinic/components/procedure-card"

/**
 * A procedure category (wireframe 02): introduction, the procedures, then the
 * category's further sections ("Na co se zaměřujeme?") and its FAQ.
 */
export default async function ProcedureCategoryTemplate({ category }: { category: ProcedureCategory }) {
  const t = await getTranslations("procedures")
  const [procedures, faq] = await Promise.all([listProcedures(category.slug), listFaq(category.slug)])
  const [intro, sections] = splitAtFirstHeading(category.body_html ?? "")
  const image = contentImage(category)

  return (
    <>
      <Section spacing="lg">
        <div className="grid items-center gap-10 small:grid-cols-[3fr_2fr] small:gap-16">
          <div>
            <Heading level={1} size="display">
              {category.title}
            </Heading>
            {intro && <RichText html={intro} className="mt-6" />}
          </div>
          {image && (
            <MediaFrame ratio="portrait" className="mx-auto max-w-md">
              <Image
                src={image.url}
                alt={image.alt ?? ""}
                fill
                priority
                sizes="(min-width: 1024px) 450px, 100vw"
                className="object-cover"
              />
            </MediaFrame>
          )}
        </div>
      </Section>

      <Section spacing="md" aria-labelledby="procedures-offer" className="pt-0 small:pt-0">
        <Heading id="procedures-offer" level={2} size="lg">
          {t("offer")}
        </Heading>
        {procedures.length > 0 ? (
          <ul className="mt-8 grid gap-x-6 gap-y-12 xsmall:grid-cols-2 small:grid-cols-3">
            {procedures.map((procedure) => (
              <li key={procedure.id}>
                <ProcedureCard procedure={procedure} />
              </li>
            ))}
          </ul>
        ) : (
          <Text tone="subtle" className="mt-6">
            {t("empty")}
          </Text>
        )}
      </Section>

      {sections && (
        <Section spacing="md" width="text">
          <RichText html={sections} className="[&>h2:first-child]:mt-0" />
        </Section>
      )}

      {faq.length > 0 && (
        <Section spacing="lg" width="text">
          <FaqList items={faq} />
        </Section>
      )}
    </>
  )
}
