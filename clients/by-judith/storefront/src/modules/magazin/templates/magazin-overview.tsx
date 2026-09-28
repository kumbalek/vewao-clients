import { getTranslations } from "next-intl/server"

import { listArticles } from "@lib/data/magazin"
import { articleTags, selectArticles } from "@lib/util/magazin"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading, Section, Text, buttonClasses } from "@modules/design-system"
import ArticleCard, { FeaturedArticle } from "@modules/magazin/components/article-card"
import TagFilter from "@modules/magazin/components/tag-filter"

function pageHref(tag: string | undefined, page: number) {
  const params = new URLSearchParams()
  if (tag) params.set("tag", tag)
  if (page > 1) params.set("page", String(page))
  const query = params.toString()
  return `/magazin${query ? `?${query}` : ""}`
}

/** Magazine overview (wireframe 08): topics, the newest article, then a grid. */
export default async function MagazinOverview({ tag, page }: { tag?: string; page?: number }) {
  const t = await getTranslations("magazin")
  const articles = await listArticles()
  const tags = articleTags(articles)
  const selection = selectArticles(articles, { tag, page })

  return (
    <>
      <Section spacing="md" className="pb-0 small:pb-0">
        <Heading level={1} size="display">
          {t("title")}
        </Heading>
        <Text tone="subtle" className="mt-3">
          {t("description")}
        </Text>
        {tags.length > 0 && (
          <div className="mt-8">
            <TagFilter tags={tags} active={tag} />
          </div>
        )}
      </Section>

      {selection.featured && (
        <Section spacing="md" className="pb-0 small:pb-0">
          <FeaturedArticle article={selection.featured} />
        </Section>
      )}

      <Section spacing="lg">
        {selection.items.length > 0 ? (
          <ul className="grid gap-x-6 gap-y-12 xsmall:grid-cols-2 small:grid-cols-3">
            {selection.items.map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} headingLevel={2} />
              </li>
            ))}
          </ul>
        ) : (
          !selection.featured && (
            <Text tone="subtle" data-testid="magazin-empty">
              {tag ? t("emptyTag") : t("empty")}
            </Text>
          )
        )}

        {selection.pageCount > 1 && (
          <nav
            aria-label={t("pagination")}
            className="mt-16 flex items-center justify-center gap-4"
          >
            {selection.page > 1 && (
              <LocalizedClientLink
                href={pageHref(tag, selection.page - 1)}
                rel="prev"
                className={buttonClasses({ variant: "secondary", size: "sm" })}
              >
                {t("previous")}
              </LocalizedClientLink>
            )}
            <Text as="span" size="sm" tone="subtle" aria-current="page">
              {t("pageOf", { page: selection.page, pageCount: selection.pageCount })}
            </Text>
            {selection.page < selection.pageCount && (
              <LocalizedClientLink
                href={pageHref(tag, selection.page + 1)}
                rel="next"
                className={buttonClasses({ variant: "secondary", size: "sm" })}
              >
                {t("next")}
              </LocalizedClientLink>
            )}
          </nav>
        )}
      </Section>
    </>
  )
}
