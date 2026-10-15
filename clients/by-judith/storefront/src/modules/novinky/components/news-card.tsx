import Image from "next/image"

import { contentImage } from "@lib/data/content"
import type { NewsPost } from "@lib/data/novinky"
import { newsLink } from "@lib/util/novinky"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading, MediaFrame, Text } from "@modules/design-system"

const validUntil = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("cs-CZ", { timeZone: "Europe/Prague" })

/** One editor post: image, title, text, offer end date and an optional link. */
export default function NewsCard({ post }: { post: NewsPost }) {
  const image = contentImage(post)
  const link = newsLink(post)
  const until = post.metadata?.platnost_do
  // Several cards say "Více informací"; the label tells them apart.
  const label = `Více informací: ${post.title}`

  return (
    <article className="flex h-full flex-col gap-4" data-testid="news-card">
      {image && (
        <MediaFrame ratio="landscape">
          <Image
            src={image.url}
            alt={image.alt ?? ""}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 512px) 50vw, 100vw"
            className="object-cover"
          />
        </MediaFrame>
      )}
      <div className="flex flex-col gap-2 px-2">
        <Heading level={3} size="md">
          {post.title}
        </Heading>
        {post.metadata?.perex && <Text tone="subtle">{post.metadata.perex}</Text>}
        {until && /^\d{4}-\d{2}-\d{2}$/.test(until) && (
          <Text size="sm" tone="subtle">
            Platí do {validUntil(until)}
          </Text>
        )}
        {link &&
          (link.external ? (
            <a href={link.href} className="text-sm underline hover:text-ink" rel="noopener" aria-label={label}>
              Více informací
            </a>
          ) : (
            <LocalizedClientLink href={link.href} className="text-sm underline hover:text-ink" aria-label={label}>
              Více informací
            </LocalizedClientLink>
          ))}
      </div>
    </article>
  )
}
