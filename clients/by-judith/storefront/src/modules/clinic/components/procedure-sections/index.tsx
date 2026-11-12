import type { LexicalState } from "@lib/cms/lexical"
import CmsRichText from "@modules/cms/components/cms-rich-text"
import type { ProcedureSection } from "@lib/util/procedures"
import { Prose } from "@modules/common/components/rich-text"
import { Card, Heading, Text } from "@modules/design-system"

/**
 * A procedure or category page's content sections (CMS blocks, #43). Each
 * block has one component here, so editors fill in content and never style it.
 */
export default function ProcedureSections({ sections }: { sections: ProcedureSection[] }) {
  return (
    <div className="flex flex-col gap-12" data-testid="procedure-sections">
      {sections.map((section, index) => (
        <ProcedureSectionView key={section.id ?? index} section={section} />
      ))}
    </div>
  )
}

function ProcedureSectionView({ section }: { section: ProcedureSection }) {
  switch (section.blockType) {
    case "textSection":
      return (
        <section className="flex flex-col gap-4">
          {section.heading && (
            <Heading level={2} size="md">
              {section.heading}
            </Heading>
          )}
          <Prose><CmsRichText state={section.content as LexicalState} /></Prose>
        </section>
      )

    case "pointsSection":
      return (
        <section className="flex flex-col gap-4">
          {section.heading && (
            <Heading level={2} size="md">
              {section.heading}
            </Heading>
          )}
          {section.intro && <Text>{section.intro}</Text>}
          {section.style === "labels" ? (
            <ul className="flex list-disc flex-col gap-3 pl-6 text-ink">
              {section.points.map((point, index) => (
                <li key={point.id ?? index}>
                  <strong className="font-bold">{point.title}</strong>
                  {point.text ? `: ${point.text}` : null}
                </li>
              ))}
            </ul>
          ) : (
            <Points ordered={section.style === "steps"}>
              {section.points.map((point, index) => (
                <li key={point.id ?? index} className="flex flex-col gap-2">
                  <Heading level={3} size="sm">
                    {point.title}
                  </Heading>
                  {point.text && <Text tone="subtle">{point.text}</Text>}
                </li>
              ))}
            </Points>
          )}
        </section>
      )

    case "preparation":
      return (
        <Card as="section" tone="outline" className="flex flex-col gap-4">
          <div>
            <Heading level={2} size="md">
              {section.name}
            </Heading>
            {section.tagline && (
              <Text tone="subtle" className="mt-1 italic">
                {section.tagline}
              </Text>
            )}
          </div>
          {section.points?.length ? (
            <dl className="flex flex-col gap-4">
              {section.points.map((point, index) => (
                <div key={point.id ?? index}>
                  <dt className="text-xs uppercase tracking-widest text-ink-muted">{point.label}</dt>
                  <dd className="mt-1">
                    <Prose className="text-base leading-7 [&_p]:mt-2 [&_ul]:mt-2">
                      <CmsRichText state={point.text as LexicalState} />
                    </Prose>
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Card>
      )

    default:
      return null
  }
}

/** Numbered steps or plain points with headings. */
function Points({ ordered, children }: { ordered: boolean; children: React.ReactNode }) {
  return ordered ? (
    <ol className="flex list-decimal flex-col gap-6 pl-6 marker:text-ink-muted">{children}</ol>
  ) : (
    <ul className="grid gap-6 small:grid-cols-2">{children}</ul>
  )
}
