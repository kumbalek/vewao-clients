import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import config from "@payload-config"
import { getPayload } from "payload"

import { lexicalHasContent, type LexicalState } from "@lib/cms/lexical"

/**
 * Writes product texts from a JSON file into Payload's product documents
 * (vewao-clients#64), e.g. seed/dp-texts.json:
 *
 *   pnpm payload run src/cms/scripts/import-product-texts.ts ../seed/dp-texts.json
 *
 * The texts are editor-only fields, which Medusa's sync user may not write, so
 * this runs server-side through the Local API. It fills empty fields only and
 * skips a document with an editor's pending draft: editors' texts always stay.
 */

type ProductTexts = { subtitle?: string | null; description?: LexicalState | null }
type ProductDoc = {
  id: number
  handle: string
  _status?: "draft" | "published" | null
  subtitle?: string | null
  description?: LexicalState | null
}

async function main() {
  const file = process.argv.at(-1)
  if (!file?.endsWith(".json")) throw new Error("Pass the texts file, e.g. ../seed/dp-texts.json")
  const { products } = JSON.parse(readFileSync(resolve(file), "utf8")) as { products: Record<string, ProductTexts> }

  const payload = await getPayload({ config })
  const counts = { updated: 0, unchanged: 0, skipped: 0 }
  for (const [handle, texts] of Object.entries(products)) {
    const { docs } = await payload.find({
      collection: "products",
      where: { handle: { equals: handle } },
      draft: true,
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
    const doc = docs[0] as unknown as ProductDoc | undefined
    if (!doc) {
      console.log(`warning ${handle}: no product document (has Medusa's sync created it?)`)
      counts.skipped++
      continue
    }
    if (doc._status === "draft") {
      console.log(`warning ${handle}: an editor's draft is pending, left alone`)
      counts.skipped++
      continue
    }
    const data: Record<string, unknown> = {}
    if (texts.subtitle && !doc.subtitle?.trim()) data.subtitle = texts.subtitle
    if (texts.description && !(doc.description && lexicalHasContent(doc.description))) data.description = texts.description
    if (!Object.keys(data).length) {
      counts.unchanged++
      continue
    }
    await payload.update({
      collection: "products",
      id: doc.id,
      data: { ...data, _status: "published" },
      overrideAccess: true,
    })
    console.log(`updated ${handle}: ${Object.keys(data).join(", ")}`)
    counts.updated++
  }
  console.log(`Product texts: ${counts.updated} updated, ${counts.unchanged} unchanged, ${counts.skipped} skipped`)
}

// `payload run` awaits the module's evaluation, then exits: only a top-level
// await keeps it running until the work is done. The storefront's es5 target
// rejects top-level await (TS1378); `payload run` executes it as ESM regardless.
// @ts-expect-error TS1378
await main()
