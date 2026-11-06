import Image from "next/image"
import { getTranslations } from "next-intl/server"

import type { CategoryBranch } from "@lib/util/procedures"
import EditLink from "@modules/cms/components/edit-link"
import ProcedureCard from "@modules/clinic/components/procedure-card"
import ProcedureSections from "@modules/clinic/components/procedure-sections"
import { Heading, MediaFrame, Section, Text } from "@modules/design-system"

/**
 * A procedure category, Východní or Západní medicína (wireframe 02): its
 * introduction and sections, then its procedures with their annotations.
 */
export default async function ProcedureCategoryTemplate({
  branch,
  edit = false,
}: {
  branch: CategoryBranch
  /** A CMS preview with edit links. */
  edit?: boolean
}) {
  const t = await getTranslations("procedures")
  const { category, procedures } = branch

  return (
    <>
      <Section spacing="lg">
        <div className="grid items-center gap-10 small:grid-cols-[3fr_2fr] small:gap-16">
          <div className="flex flex-col items-start gap-6">
            <Heading level={1} size="display">
              {category.title}
            </Heading>
            {edit && <EditLink collection="procedure-categories" id={category.id} label={`Upravit kategorii ${category.name}`} />}
            {category.perex && <Text size="lead">{category.perex}</Text>}
          </div>
          {category.image && (
            <MediaFrame ratio="portrait" className="mx-auto w-full max-w-md">
              <Image
                src={category.image.url}
                alt={category.image.alt ?? ""}
                fill
                priority
                sizes="(min-width: 1024px) 450px, 100vw"
                className="object-cover"
              />
            </MediaFrame>
          )}
        </div>
      </Section>

      {category.sections.length > 0 && (
        <Section spacing="md" width="text" className="pt-0 small:pt-0">
          <ProcedureSections sections={category.sections} />
        </Section>
      )}

      <Section spacing="md" aria-labelledby="procedures-offer">
        <Heading id="procedures-offer" level={2} size="lg">
          {t("offer")}
        </Heading>
        {procedures.length > 0 ? (
          <ul className="mt-8 grid gap-x-6 gap-y-12 xsmall:grid-cols-2 small:grid-cols-3">
            {procedures.map(({ procedure }) => (
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
    </>
  )
}
