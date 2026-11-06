import Image from "next/image"
import { useTranslations } from "next-intl"

import { bookingPath } from "content/site"
import { clip } from "@lib/data/content"
import type { ProcedureEntry } from "@lib/util/procedures"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ButtonLink, Heading, MediaFrame, Text } from "@modules/design-system"

/**
 * A procedure on its category or parent page (wireframe 02): its annotation,
 * then book directly or open the detail.
 */
export default function ProcedureCard({ procedure }: { procedure: ProcedureEntry }) {
  const t = useTranslations("procedures")
  const facts = [procedure.duration, procedure.priceSummary].filter(Boolean).join(" · ")
  const text = procedure.annotation || (procedure.perex && clip(procedure.perex, 180))

  return (
    <article className="flex h-full flex-col gap-4" data-testid="procedure-card">
      <MediaFrame ratio="landscape">
        {procedure.image && (
          <Image
            src={procedure.image.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 512px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </MediaFrame>
      <div className="flex flex-1 flex-col gap-2 px-2">
        <Heading level={3} size="md">
          <LocalizedClientLink
            href={procedure.href}
            className="hover:text-ink-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            {procedure.name}
          </LocalizedClientLink>
        </Heading>
        {text && (
          <Text size="sm" tone="subtle" className="line-clamp-4">
            {text}
          </Text>
        )}
        {facts && (
          <Text size="xs" tone="muted">
            {facts}
          </Text>
        )}
      </div>
      <div className="flex flex-wrap gap-2 px-2">
        <ButtonLink href={bookingPath} size="sm" className="flex-1">
          {t("book")}
        </ButtonLink>
        <ButtonLink
          href={procedure.href}
          size="sm"
          variant="secondary"
          aria-label={`${procedure.annotationLink || t("detail")}: ${procedure.name}`}
        >
          {procedure.annotationLink || t("detail")}
        </ButtonLink>
      </div>
    </article>
  )
}
