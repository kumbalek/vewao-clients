import { readFileSync } from "node:fs"

import { connect, log, type CollectionDef, type FieldDef } from "./content/admin-api.ts"
import type { SnapshotImage } from "./content/sanity.ts"
import type { ClinicSnapshot } from "./extract-clinic.ts"

/**
 * Import clinic.json into Content plugin collections: page texts, team,
 * procedure categories, procedures and FAQ. Additive and idempotent: an item
 * whose slug exists is left alone so admin edits survive. published_at stays
 * empty. Display order comes from the "poradi" field, not creation order.
 */

const snapshot = JSON.parse(
  readFileSync(new URL("./clinic.json", import.meta.url), "utf8")
) as ClinicSnapshot
const categorySlugs = snapshot.categories.map((c) => c.slug)

const image: FieldDef[] = [
  { name: "image", label: "Obrázek (URL)", field_type: "image" },
  { name: "image_alt", label: "Popis obrázku", field_type: "text" },
]
const order: FieldDef = { name: "poradi", label: "Pořadí", field_type: "number" }
const source: FieldDef = { name: "source_url", label: "Původní adresa na bbclinic.cz", field_type: "text" }
const category: FieldDef = {
  name: "kategorie",
  label: "Kategorie",
  field_type: "select",
  options: { values: categorySlugs },
}

const PAGES: CollectionDef = {
  label: "Stránky",
  slug: "stranky",
  format: "md",
  fields: [{ name: "perex", label: "Perex", field_type: "rich_text" }, ...image, source],
}
const TEAM: CollectionDef = {
  label: "Tým",
  slug: "tym",
  format: "text",
  fields: [
    { name: "role", label: "Role", field_type: "text" },
    { name: "kvalifikace", label: "Kvalifikace", field_type: "text" },
    ...image,
    { name: "pismeno", label: "Písmeno monogramu (bez fotografie)", field_type: "text" },
    order,
    source,
  ],
}
const CATEGORIES: CollectionDef = {
  label: "Kategorie procedur",
  slug: "kategorie-procedur",
  format: "md",
  fields: [{ name: "perex", label: "Krátký popis (menu)", field_type: "rich_text" }, ...image, order, source],
}
const PROCEDURES: CollectionDef = {
  label: "Procedury",
  slug: "procedury",
  format: "md",
  fields: [
    category,
    { name: "perex", label: "Krátký popis (karta)", field_type: "rich_text" },
    { name: "cena", label: "Cena (souhrn)", field_type: "text" },
    { name: "delka", label: "Délka", field_type: "text" },
    { name: "cenik", label: "Ceník – na každý řádek: Název — Cena", field_type: "rich_text" },
    ...image,
    { name: "rezervace_url", label: "Odkaz na rezervaci", field_type: "text" },
    order,
    source,
  ],
}
const FAQ: CollectionDef = {
  label: "Časté dotazy",
  slug: "faq",
  format: "text",
  fields: [category, order],
}

const content = connect()

type Item = { slug: string; title: string; body: string }

/** Create the collection's missing items; images upload only for new items. */
async function importItems<T extends Item>(
  def: CollectionDef,
  items: T[],
  metadata: (item: T, upload: (image: SnapshotImage, name: string) => Promise<string>) => Promise<object>
) {
  const collectionId = await content.ensureCollection(def)
  const existing = await content.itemSlugs(collectionId)
  const created = items.filter((item) => !existing.has(item.slug))
  await content.assertSlugsAvailable(def.slug, created.map((item) => item.slug))

  for (const item of items) {
    if (existing.has(item.slug)) {
      log("exists", `${def.slug}/${item.slug}`)
      continue
    }
    const upload = (image: SnapshotImage, name: string) => content.upload(collectionId, image, name)
    await content.createItem(collectionId, {
      title: item.title,
      slug: item.slug,
      body: item.body || null,
      metadata: await metadata(item, upload),
    })
    log("created", `${def.slug}/${item.slug}`)
  }
}

const imageFields = async (
  picture: SnapshotImage | null,
  name: string,
  upload: (image: SnapshotImage, name: string) => Promise<string>
) => ({
  image: picture ? await upload(picture, name) : null,
  image_alt: picture?.alt ?? null,
  image_width: picture?.width ?? null,
  image_height: picture?.height ?? null,
})

async function main() {
  await importItems(PAGES, snapshot.pages, async (page, upload) => {
    const gallery = []
    for (const [index, photo] of page.gallery.entries()) {
      gallery.push({
        url: await upload(photo, `${page.slug}-${index + 2}`),
        alt: photo.alt,
        width: photo.width,
        height: photo.height,
      })
    }
    return {
      perex: page.perex,
      ...(await imageFields(page.image, page.slug, upload)),
      gallery,
      source_url: page.source_url,
    }
  })

  await importItems(TEAM, snapshot.team, async (member, upload) => ({
    role: member.role,
    kvalifikace: null,
    ...(await imageFields(member.image, member.slug, upload)),
    pismeno: member.letter,
    poradi: member.order,
    source_url: member.source_url,
  }))

  await importItems(CATEGORIES, snapshot.categories, async (item, upload) => ({
    perex: null,
    ...(await imageFields(item.image, item.slug, upload)),
    poradi: item.order,
    source_url: item.source_url,
  }))

  await importItems(PROCEDURES, snapshot.procedures, async (procedure, upload) => ({
    kategorie: procedure.category,
    perex: null,
    cena: procedure.price,
    delka: null,
    cenik: procedure.price_list.map((row) => `${row.title} — ${row.price}`).join("\n") || null,
    ...(await imageFields(procedure.image, procedure.slug, upload)),
    rezervace_url: procedure.booking_url,
    poradi: procedure.order,
    source_url: procedure.source_url,
  }))

  await importItems(FAQ, snapshot.faq, async (question) => ({
    kategorie: question.category,
    poradi: question.order,
  }))

  console.log("Clinic content import complete.")
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
