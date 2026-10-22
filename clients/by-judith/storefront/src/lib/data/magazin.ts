import "server-only"

import {
  cmsMediaUrl,
  getCmsArticle,
  listCmsArticles,
  type CmsArticle,
  type CmsMedia,
} from "@lib/cms/client"
import { lexicalToPlainText, type LexicalState } from "@lib/cms/lexical"
import { clip } from "@lib/data/content"

/** Magazine articles from the Payload CMS (vewao-clients#39). */

export type ArticleImage = {
  url: string
  alt: string | null
  width?: number | null
  height?: number | null
}

export type Article = {
  id: number
  slug: string
  title: string
  excerpt: string | null
  publishedAt: string | null
  /** Topic names, lower-case ("atopický ekzém"). */
  topics: string[]
  image: ArticleImage | null
  gallery: ArticleImage[]
  body: LexicalState
}

const image = (media: CmsMedia | number | null | undefined): ArticleImage | null =>
  media && typeof media === "object"
    ? { url: cmsMediaUrl(media), alt: media.alt || null, width: media.width, height: media.height }
    : null

function toArticle(doc: CmsArticle): Article {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt || null,
    publishedAt: doc.publishedAt ?? null,
    topics: (doc.topics ?? []).flatMap((topic) => (typeof topic === "object" ? [topic.name] : [])),
    image: image(doc.image),
    gallery: (doc.gallery ?? []).flatMap((media) => image(media) ?? []),
    body: doc.body ?? null,
  }
}

/** All published articles, newest first; empty if the CMS cannot be reached. */
export async function listArticles(): Promise<Article[]> {
  try {
    return (await listCmsArticles()).map(toArticle)
  } catch (error) {
    console.error("Magazín could not be loaded", error)
    return []
  }
}

/** A published article, or its latest draft inside a preview. */
export async function getArticle(slug: string, draft = false): Promise<Article | null> {
  const doc = await getCmsArticle(slug, draft)
  return doc ? toArticle(doc) : null
}

/** Card/teaser text: the perex, else the start of the article. */
export const articleExcerpt = (article: Article, length = 180) =>
  clip(article.excerpt || lexicalToPlainText(article.body), length)

export const articleImage = (article: Article) => article.image
