import Image from "next/image"
import { getTranslations } from "next-intl/server"

import { listTeam, type Page } from "@lib/data/clinic"
import { contentImage } from "@lib/data/content"
import { RichText } from "@modules/common/components/rich-text"
import { Heading, MediaFrame, Section, Text } from "@modules/design-system"
import TeamCard from "@modules/clinic/components/team-card"

/** O nás (wireframe 10): the clinic's story, its photos, then the team. */
export default async function AboutTemplate({ page }: { page: Page }) {
  const t = await getTranslations("about")
  const team = await listTeam()
  const image = contentImage(page)
  const gallery = page.metadata?.gallery ?? []

  return (
    <>
      <Section spacing="lg">
        <div className="grid items-center gap-10 small:grid-cols-2 small:gap-16">
          <div>
            <Heading level={1} size="display">
              {page.title}
            </Heading>
            {page.metadata?.perex && (
              <Text size="lead" className="mt-6">
                {page.metadata.perex}
              </Text>
            )}
            {page.body_html && (
              <RichText html={page.body_html} className="mt-6 text-base leading-7 text-ink-subtle" />
            )}
          </div>
          {image && (
            <MediaFrame ratio="landscape">
              <Image
                src={image.url}
                alt={image.alt ?? ""}
                fill
                priority
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover"
              />
            </MediaFrame>
          )}
        </div>
        {gallery.length > 0 && (
          <ul className="mt-10 grid gap-6 xsmall:grid-cols-2">
            {gallery.map((photo) => (
              <li key={photo.url}>
                <MediaFrame ratio="landscape">
                  <Image
                    src={photo.url}
                    alt={photo.alt ?? ""}
                    fill
                    sizes="(min-width: 1024px) 600px, (min-width: 512px) 50vw, 100vw"
                    className="object-cover"
                  />
                </MediaFrame>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {team.length > 0 && (
        <Section spacing="lg" aria-labelledby="team-title" className="pt-0 small:pt-0">
          <Heading id="team-title" level={2} size="lg">
            {t("team")}
          </Heading>
          <ul className="mt-8 grid gap-x-6 gap-y-12 xsmall:grid-cols-2 small:grid-cols-3 medium:grid-cols-4">
            {team.map((member) => (
              <li key={member.id}>
                <TeamCard member={member} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )
}
