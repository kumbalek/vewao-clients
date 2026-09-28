import Image from "next/image"
import { useTranslations } from "next-intl"

import { articleExcerpt, articleImage, type Article } from "@lib/data/magazin"
import { tagLabel } from "@lib/util/magazin"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading, MediaFrame, Text } from "@modules/design-system"

// The title link stretches over the whole card: one link, named by the title.
const stretchedLink =
  "after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ink"

export function ArticleMeta({ article, featured = false }: { article: Article; featured?: boolean }) {
  const t = useTranslations("magazin")
  const parts = [
    ...(featured ? [t("featured")] : []),
    ...article.tags.map((tag) => tagLabel(tag.value)),
    ...(article.published_at
      ? [new Date(article.published_at).toLocaleDateString("cs-CZ")]
      : []),
  ]

  return parts.length ? (
    <Text as="p" size="xs" tone="subtle" className="uppercase tracking-widest">
      {parts.join(" · ")}
    </Text>
  ) : null
}

/** Teaser image; decorative, since the title names the link. */
function Teaser({ article, sizes }: { article: Article; sizes: string }) {
  const image = articleImage(article)
  return (
    <MediaFrame ratio="landscape">
      {image && (
        <Image
          src={image.url}
          alt=""
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
        />
      )}
    </MediaFrame>
  )
}

export default function ArticleCard({
  article,
  headingLevel = 3,
}: {
  article: Article
  headingLevel?: 2 | 3
}) {
  return (
    <article className="group relative flex h-full flex-col gap-4" data-testid="article-card">
      <Teaser article={article} sizes="(min-width: 1024px) 400px, (min-width: 512px) 50vw, 100vw" />
      <div className="flex flex-col gap-2 px-2">
        <ArticleMeta article={article} />
        <Heading level={headingLevel} size="md">
          <LocalizedClientLink href={`/magazin/${article.slug}`} className={stretchedLink}>
            {article.title}
          </LocalizedClientLink>
        </Heading>
        <Text size="sm" tone="subtle" className="line-clamp-3">
          {articleExcerpt(article)}
        </Text>
      </div>
    </article>
  )
}

/** The newest article, side by side with its perex (wireframe 08). */
export function FeaturedArticle({ article }: { article: Article }) {
  const t = useTranslations("magazin")

  return (
    <article
      className="group relative grid items-center gap-6 small:grid-cols-2 small:gap-12"
      data-testid="featured-article"
    >
      <Teaser article={article} sizes="(min-width: 1024px) 620px, 100vw" />
      <div className="flex flex-col items-start gap-4 px-2">
        <ArticleMeta article={article} featured />
        <Heading level={2} size="lg">
          <LocalizedClientLink href={`/magazin/${article.slug}`} className={stretchedLink}>
            {article.title}
          </LocalizedClientLink>
        </Heading>
        <Text tone="subtle">{articleExcerpt(article, 280)}</Text>
        <Text as="span" size="sm" aria-hidden="true" className="text-sage-strong">
          {t("read")} ↗
        </Text>
      </div>
    </article>
  )
}
