import { Metadata } from "next"
import { notFound } from "next/navigation"

import { articleExcerpt, articleImage, getArticle } from "@lib/data/magazin"
import ArticleTemplate from "@modules/magazin/templates/article"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const article = await getArticle(slug)
  if (!article) return {}

  const image = articleImage(article)
  const description = articleExcerpt(article, 160)
  return {
    title: article.title,
    description,
    openGraph: {
      type: "article",
      title: article.title,
      description,
      images: image ? [{ url: image.url, alt: image.alt ?? undefined }] : undefined,
    },
  }
}

export default async function ArticlePage(props: Props) {
  const { slug } = await props.params
  const article = await getArticle(slug)
  if (!article) notFound()

  return <ArticleTemplate article={article} />
}
