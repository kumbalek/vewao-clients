import Image from "next/image"
import { getTranslations } from "next-intl/server"

import { footer } from "content/site"
import { articleImage, listArticles, type Article } from "@lib/data/magazin"
import { relatedArticles } from "@lib/util/magazin"
import Breadcrumbs from "@modules/common/components/breadcrumbs"
import { CopyText } from "@modules/common/components/placeholder"
import { PlainText, RichText } from "@modules/common/components/rich-text"
import { Card, Container, Heading, MediaFrame, Section, Text } from "@modules/design-system"
import ArticleCard, { ArticleMeta } from "@modules/magazin/components/article-card"


/** Magazine article (wireframe 08, article layout). */
export default async function ArticleTemplate({ article }: { article: Article }) {
  const t = await getTranslations("magazin")
  const image = articleImage(article)
  const gallery = article.metadata?.gallery ?? []
  const related = relatedArticles(await listArticles(), article)

  return (
    <article>
      <Container width="text" className="pt-6">
        <Breadcrumbs
          path={[
            { name: t("home"), href: "/" },
            { name: t("title"), href: "/magazin" },
          ]}
        />
        <header className="mt-10 flex flex-col gap-4">
          <ArticleMeta article={article} />
          <Heading level={1} size="display">
            {article.title}
          </Heading>
          {article.metadata?.excerpt && (
            <Text size="lead" tone="subtle">
              {article.metadata.excerpt}
            </Text>
          )}
        </header>

        {image && (
          <MediaFrame className="mt-10">
            {image.width && image.height ? (
              <Image
                src={image.url}
                alt={image.alt ?? ""}
                width={image.width}
                height={image.height}
                priority
                sizes="(min-width: 800px) 768px, 100vw"
                className="h-auto w-full"
              />
            ) : (
              <div className="relative aspect-[4/3]">
                <Image src={image.url} alt={image.alt ?? ""} fill priority sizes="768px" className="object-cover" />
              </div>
            )}
          </MediaFrame>
        )}

        {article.body_html ? (
          <RichText html={article.body_html} className="mt-10" data-testid="article-body" />
        ) : (
          <PlainText text={article.body ?? ""} className="mt-10" data-testid="article-body" />
        )}

        {gallery.length > 0 && (
          <section aria-labelledby="article-gallery" className="mt-12">
            <Heading id="article-gallery" level={2} size="md">
              {t("gallery")}
            </Heading>
            <ul className="mt-6 grid gap-4 xsmall:grid-cols-2">
              {gallery.map((photo, index) => (
                <li key={photo.url}>
                  <MediaFrame ratio="landscape">
                    <Image
                      src={photo.url}
                      alt={
                        photo.alt ??
                        t("photo", { title: article.title, n: index + 1, total: gallery.length })
                      }
                      fill
                      sizes="(min-width: 800px) 380px, 100vw"
                      className="object-cover"
                    />
                  </MediaFrame>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Card as="aside" className="mt-16" aria-labelledby="magazin-newsletter">
          <Heading id="magazin-newsletter" level={2} size="md">
            {t("newsletterTitle")}
          </Heading>
          <Text size="sm" tone="subtle" className="mt-2">
            <CopyText value={footer.newsletter} />
          </Text>
        </Card>
      </Container>

      {related.length > 0 && (
        <Section spacing="lg" aria-labelledby="related-articles">
          <Heading id="related-articles" level={2} size="lg">
            {t("related")}
          </Heading>
          <ul className="mt-8 grid gap-x-6 gap-y-12 xsmall:grid-cols-2 small:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <ArticleCard article={item} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  )
}
