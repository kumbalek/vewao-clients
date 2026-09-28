import "server-only"

import {
  contentImage,
  getContentItem,
  listContentItems,
  teaser,
  type ContentImage,
  type ContentItem,
  type ImageMetadata,
} from "@lib/data/content"

/** Magazine articles: the Content plugin's "magazin" collection (Markdown). */

export const MAGAZIN = "magazin"

export type ArticleImage = ContentImage

export type Article = ContentItem<
  ImageMetadata & {
    excerpt?: string | null
    gallery?: ArticleImage[]
    source_url?: string | null
  }
>

/** All published articles, newest first. */
export const listArticles = () => listContentItems<NonNullable<Article["metadata"]>>(MAGAZIN)

export const getArticle = (slug: string) =>
  getContentItem<NonNullable<Article["metadata"]>>(MAGAZIN, slug)

/** Card/teaser text: the perex, else the start of the article. */
export const articleExcerpt = (article: Article, length = 180) =>
  teaser(article.metadata?.excerpt, article.body, length)

export const articleImage = (article: Article) => contentImage(article)
