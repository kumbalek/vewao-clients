import { readFileSync } from "node:fs"

import { log } from "./content/admin-api.ts"
import type { SnapshotImage } from "./content/sanity.ts"
import type { SnapshotArticle } from "./extract-magazin.ts"
import { markdownToLexical } from "./payload/markdown-lexical.ts"
import { connectPayload } from "./payload/rest.ts"

/**
 * Import magazin.json into the Payload CMS in the storefront (vewao-clients#39):
 * topics, images and published articles. Additive and idempotent by slug: an
 * existing article is left alone, so CMS edits survive a re-run. Articles are
 * created oldest first, so creation order reproduces the magazine's order.
 * `--dry-run` converts every article and reports what would be created.
 */

const DRY_RUN = process.argv.includes("--dry-run")
// The same cap as the Content plugin import; the CDN resizes on request.
const MAX_IMAGE_WIDTH = 1600
const EXTENSIONS: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" }

async function download(image: SnapshotImage): Promise<{ file: Blob; extension: string }> {
  const response = await fetch(`${image.url}?w=${MAX_IMAGE_WIDTH}&fit=max`)
  if (!response.ok) throw new Error(`GET ${image.url}: HTTP ${response.status}`)
  const type = response.headers.get("content-type")?.split(";")[0] ?? ""
  const extension = EXTENSIONS[type]
  if (!extension) throw new Error(`${image.url}: unexpected content type ${type}`)
  return { file: new Blob([await response.arrayBuffer()], { type }), extension }
}

async function main() {
  const { articles } = JSON.parse(readFileSync(new URL("./magazin.json", import.meta.url), "utf8")) as {
    articles: SnapshotArticle[]
  }
  // Convert everything first: a body that cannot be converted stops the run before any write.
  const bodies = new Map(articles.map((article) => [article.slug, markdownToLexical(article.body ?? "")]))

  const cms = connectPayload()
  await cms.signIn()
  console.log(`${DRY_RUN ? "Dry run against" : "Importing into"} ${cms.baseUrl}`)

  const topics = new Map<string, number>()
  for (const name of new Set(articles.flatMap((article) => article.tags))) {
    const existing = await cms.findOne("topics", "name", name)
    if (existing) {
      topics.set(name, existing.id)
      log("exists", `topic ${name}`)
    } else if (DRY_RUN) {
      log("planned", `topic ${name}`)
    } else {
      topics.set(name, (await cms.create("topics", { name })).id)
      log("created", `topic ${name}`)
    }
  }

  const counts = { created: 0, exists: 0, images: 0 }
  for (const article of [...articles].reverse()) {
    if (await cms.findOne("articles", "slug", article.slug)) {
      log("exists", `article ${article.slug}`)
      counts.exists++
      continue
    }
    const imageCount = (article.image ? 1 : 0) + article.gallery.length
    if (DRY_RUN) {
      log("planned", `article ${article.slug} (${imageCount} images)`)
      counts.created++
      counts.images += imageCount
      continue
    }

    const store = async (image: SnapshotImage, name: string, alt: string) => {
      const { file, extension } = await download(image)
      counts.images++
      return (await cms.upload(file, `${name}.${extension}`, alt)).id
    }
    const image = article.image ? await store(article.image, article.slug, article.image.alt || article.title) : null
    const gallery: number[] = []
    for (const [index, photo] of article.gallery.entries()) {
      // The page's own wording for a photo without a description.
      const alt = photo.alt || `${article.title} – fotografie ${index + 1} z ${article.gallery.length}`
      gallery.push(await store(photo, `${article.slug}-galerie-${index + 1}`, alt))
    }

    await cms.create("articles", {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || null,
      body: bodies.get(article.slug),
      topics: article.tags.map((name) => topics.get(name)),
      image,
      gallery,
      sourceUrl: article.source_url,
      _status: "published",
    })
    log("created", `article ${article.slug}`)
    counts.created++
  }

  console.log(
    `${DRY_RUN ? "Would create" : "Created"} ${counts.created} articles with ${counts.images} images; ${counts.exists} already existed.`
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
