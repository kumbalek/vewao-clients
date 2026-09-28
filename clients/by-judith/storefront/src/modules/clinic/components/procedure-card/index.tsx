import Image from "next/image"
import { useTranslations } from "next-intl"

import { bookingPath } from "content/site"
import { procedureHref, type Procedure } from "@lib/data/clinic"
import { contentImage, teaser } from "@lib/data/content"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ButtonLink, Heading, MediaFrame, Text } from "@modules/design-system"

/** A procedure in a category grid (wireframe 02): book directly or open the detail. */
export default function ProcedureCard({ procedure }: { procedure: Procedure }) {
  const t = useTranslations("procedures")
  const image = contentImage(procedure)
  const href = procedureHref(procedure)
  const facts = [procedure.metadata?.delka, procedure.metadata?.cena].filter(Boolean).join(" · ")

  return (
    <article className="flex h-full flex-col gap-4" data-testid="procedure-card">
      <MediaFrame ratio="landscape">
        {image && (
          <Image
            src={image.url}
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
            href={href}
            className="hover:text-ink-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            {procedure.title}
          </LocalizedClientLink>
        </Heading>
        <Text size="sm" tone="subtle" className="line-clamp-3">
          {teaser(procedure.metadata?.perex, procedure.body)}
        </Text>
        {facts && (
          <Text size="xs" tone="muted">
            {facts}
          </Text>
        )}
      </div>
      <div className="flex gap-2 px-2">
        <ButtonLink href={bookingPath} size="sm" className="flex-1">
          {t("book")}
        </ButtonLink>
        <ButtonLink href={href} size="sm" variant="secondary">
          {t("detail")}
        </ButtonLink>
      </div>
    </article>
  )
}
