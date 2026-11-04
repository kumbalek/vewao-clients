import { Metadata } from "next"
import { notFound } from "next/navigation"

import { previewGrantFor } from "@lib/cms/client"
import { articleExcerpt, articleImage, getArticle } from "@lib/data/magazin"
import PreviewBar from "@modules/cms/components/preview-bar"
import ArticleTemplate from "@modules/magazin/templates/article"

type Props = { params: Promise<{ countryCode: string; slug: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const article = await getArticle(slug).catch(() => null)
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
  const { countryCode, slug } = await props.params
  const path = `/${countryCode}/magazin/${slug}`
  // A signed CMS preview of this article shows its latest draft.
  const grant = await previewGrantFor(path)
  const article = await getArticle(slug, Boolean(grant))
  if (!article) notFound()
  const edit = grant?.mode === "edit"

  return (
    <>
      <ArticleTemplate article={article} edit={edit} />
      {grant && <PreviewBar path={path} editHref={`/admin/collections/articles/${article.id}`} edit={edit} />}
    </>
  )
}
