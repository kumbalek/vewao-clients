import { readFileSync } from "node:fs"

import { connect, log, type CollectionDef } from "./content/admin-api.ts"
import type { SnapshotArticle } from "./extract-magazin.ts"

/**
 * Import magazin.json into the Content plugin's "magazin" collection: images
 * (uploaded to Medusa's file storage), articles and their tags. Additive and
 * idempotent: an existing article is left alone, only missing tags are added.
 * Articles are created oldest first, so creation order reproduces the source's
 * order. published_at stays empty: the source has no dates.
 */

const MAGAZIN: CollectionDef = {
  label: "Magazín",
  slug: "magazin",
  format: "md",
  fields: [
    { name: "excerpt", label: "Perex", field_type: "rich_text" },
    { name: "image", label: "Hlavní obrázek (URL)", field_type: "image" },
    { name: "image_alt", label: "Popis hlavního obrázku", field_type: "text" },
    { name: "source_url", label: "Původní adresa na bbclinic.cz", field_type: "text" },
  ],
}

async function main() {
  const { articles } = JSON.parse(
    readFileSync(new URL("./magazin.json", import.meta.url), "utf8")
  ) as { articles: SnapshotArticle[] }
  const content = connect()

  const collectionId = await content.ensureCollection(MAGAZIN)
  const existing = await content.itemSlugs(collectionId)
  await content.assertSlugsAvailable(
    MAGAZIN.slug,
    articles.map((a) => a.slug).filter((slug) => !existing.has(slug))
  )

  for (const article of [...articles].reverse()) {
    let itemId = existing.get(article.slug)

    if (itemId) {
      log("exists", `article ${article.slug}`)
    } else {
      const image = article.image
        ? await content.upload(collectionId, article.image, article.slug)
        : null
      const gallery = []
      for (const [index, photo] of article.gallery.entries()) {
        gallery.push({
          url: await content.upload(collectionId, photo, `${article.slug}-galerie-${index + 1}`),
          alt: photo.alt,
          width: photo.width,
          height: photo.height,
        })
      }

      itemId = await content.createItem(collectionId, {
        title: article.title,
        slug: article.slug,
        body: article.body,
        metadata: {
          excerpt: article.excerpt,
          image,
          image_alt: article.image?.alt ?? null,
          image_width: article.image?.width ?? null,
          image_height: article.image?.height ?? null,
          gallery,
          source_url: article.source_url,
        },
      })
      log("created", `article ${article.slug}`)
    }

    await content.ensureTags(collectionId, itemId, article.tags, article.slug)
  }
  console.log("Magazine import complete.")
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
