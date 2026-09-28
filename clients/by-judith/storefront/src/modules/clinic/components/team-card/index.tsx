import Image from "next/image"
import { useTranslations } from "next-intl"

import type { TeamMember } from "@lib/data/clinic"
import { contentImage } from "@lib/data/content"
import { monogram } from "@lib/util/clinic"
import { PlainText } from "@modules/common/components/rich-text"
import { Heading, MediaFrame, Text } from "@modules/design-system"

/** A team member (wireframe 10): photo or monogram, role, and the bio on request. */
export default function TeamCard({ member }: { member: TeamMember }) {
  const t = useTranslations("about")
  const photo = contentImage(member)
  const role = [member.metadata?.role, member.metadata?.kvalifikace].filter(Boolean).join(" · ")
  const bio = member.body?.trim() ?? ""

  return (
    <article className="group flex flex-col gap-4" data-testid="team-member">
      <MediaFrame ratio="portrait">
        {photo ? (
          <Image
            src={photo.url}
            alt={photo.alt ?? member.title}
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 512px) 50vw, 100vw"
            className="object-cover object-top"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-cream text-8xl text-gold"
          >
            {monogram(member.title, member.metadata?.pismeno)}
          </span>
        )}
      </MediaFrame>
      <div className="flex flex-col gap-2 px-2">
        <Heading level={3} size="md">
          {member.title}
        </Heading>
        {role && (
          <Text size="xs" tone="subtle" className="uppercase tracking-widest">
            {role}
          </Text>
        )}
        {bio && (
          <>
            <Text size="sm" tone="subtle" className="line-clamp-4 group-has-[details[open]]:hidden">
              {bio.split(/\n{2,}/)[0]}
            </Text>
            <details>
              <summary className="cursor-pointer list-none text-sm text-sage-strong underline underline-offset-4 hover:text-ink [&::-webkit-details-marker]:hidden">
                {t("readMore")}
              </summary>
              <PlainText text={bio} className="mt-3 text-sm leading-relaxed text-ink-subtle [&_p]:mt-3" />
            </details>
          </>
        )}
      </div>
    </article>
  )
}
