import { writeFileSync } from "node:fs"

import { SITE, SLUG, pageData, pause, sanityImage, type SanityImage, type SnapshotImage } from "./content/sanity.ts"
import { portableTextToMarkdown, portableTextToPlain, type Block } from "./magazin/portable-text.ts"

/**
 * Snapshot the bbclinic.cz magazine into magazin.json for import-magazin.ts.
 * The source has no publication dates or authors; none are invented here.
 * Images stay on Sanity's CDN until the import uploads them to Medusa.
 */

type SourceArticle = {
  title: string
  categories: { title: string }[]
  mainImage: SanityImage | null
  _rawExcerpt: Block[] | null
  _rawBody: Block[] | null
  galery: SanityImage[] | null
}

export type SnapshotArticle = {
  slug: string
  title: string
  excerpt: string | null
  body: string
  tags: string[]
  image: SnapshotImage | null
  gallery: SnapshotImage[]
  source_url: string
}

async function main() {
  const listing = await pageData<{ magazin: { nodes: { slug: { current: string } }[] } }>(
    "/magazin"
  )
  const articles: SnapshotArticle[] = []

  // The listing is newest first; keep that order.
  for (const { slug: { current: slug } } of listing.magazin.nodes) {
    if (!SLUG.test(slug)) throw new Error(`Slug "${slug}" is not valid for the content plugin`)
    const { article } = await pageData<{ article: SourceArticle }>(`/magazin/${slug}`)

    articles.push({
      slug,
      title: article.title.trim(),
      excerpt: portableTextToPlain(article._rawExcerpt) || null,
      body: portableTextToMarkdown(article._rawBody),
      tags: [...new Set(article.categories.map((c) => c.title.trim()).filter(Boolean))],
      image: sanityImage(article.mainImage),
      gallery: (article.galery ?? []).map(sanityImage).filter((i) => i !== null),
      source_url: `${SITE}/magazin/${slug}/`,
    })
    console.log(`extracted ${slug}`)
    await pause()
  }

  const snapshot = {
    source: `${SITE}/magazin/`,
    extracted_at: new Date().toISOString().slice(0, 10),
    articles,
  }
  writeFileSync(new URL("./magazin.json", import.meta.url), JSON.stringify(snapshot, null, 2) + "\n")
  console.log(`${articles.length} articles written to magazin.json`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
