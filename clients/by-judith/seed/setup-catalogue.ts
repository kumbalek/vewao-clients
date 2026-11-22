import Medusa from "@medusajs/js-sdk"

/**
 * The new shop's catalogue structure (vewao-clients#64): product categories,
 * then placeholder products as the owner lists them. Production gets the
 * catalogue prepared on localhost and dev, without a legacy migration (D23);
 * this script sets up the same structure on any other backend.
 *
 * Additive and idempotent: it creates what is missing and never changes or
 * deletes existing records, so admin edits survive a re-run.
 *
 *   MEDUSA_BACKEND_URL=https://… MEDUSA_ADMIN_API_KEY=sk_… pnpm catalogue:setup
 */

type CategoryDef = {
  name: string
  handle: string
  /** Collections whose products belong in the category: the legacy product lines. */
  collections?: string[]
}

/** Owner's order, 2026-11-22. */
export const CATEGORIES: CategoryDef[] = [
  // The herb lines: every Acute and Gold Edition product, including later ones.
  { name: "Herbs", handle: "herbs", collections: ["acute", "gold"] },
  { name: "TCM", handle: "tcm" },
  { name: "Estetika", handle: "estetika" },
  { name: "Ultherapy®", handle: "ultherapy" },
  { name: "DP Dermaceuticals", handle: "dp-dermaceuticals" },
]

function createClient() {
  const baseUrl = process.env.MEDUSA_BACKEND_URL
  const apiKey = process.env.MEDUSA_ADMIN_API_KEY
  if (!baseUrl || !apiKey?.startsWith("sk_")) {
    throw new Error("Set MEDUSA_BACKEND_URL and a secret MEDUSA_ADMIN_API_KEY (sk_...).")
  }
  return new Medusa({ baseUrl, apiKey })
}

const sdk = createClient()

function log(action: "created" | "exists" | "updated" | "warning", what: string) {
  console.log(`${action.padEnd(7)} ${what}`)
}

async function ensureCategory(def: CategoryDef, rank: number) {
  const { product_categories } = await sdk.admin.productCategory.list({
    handle: def.handle,
    fields: "id,name,handle",
  })
  const existing = product_categories[0]
  if (existing) {
    log("exists", `category ${existing.name} (${existing.handle})`)
    return existing
  }
  const { product_category } = await sdk.admin.productCategory.create({
    name: def.name,
    handle: def.handle,
    is_active: true,
    is_internal: false,
    rank,
  })
  log("created", `category ${def.name} (${def.handle})`)
  return product_category
}

/** Adds the collections' products to the category; products already in it stay as they are. */
async function addCollectionProducts(category: { id: string; name: string }, handles: string[]) {
  const { collections } = await sdk.admin.productCollection.list({ handle: handles, fields: "id,handle" })
  for (const handle of handles) {
    if (!collections.some((collection) => collection.handle === handle)) {
      log("warning", `collection ${handle} not found; its products are not in ${category.name}`)
    }
  }
  if (!collections.length) return

  const missing: { id: string; handle: string }[] = []
  for (let offset = 0; ; offset += 100) {
    const { products, count } = await sdk.admin.product.list({
      collection_id: collections.map((collection) => collection.id),
      fields: "id,handle,*categories",
      limit: 100,
      offset,
    })
    for (const product of products) {
      if (!product.categories?.some((c) => c?.id === category.id)) {
        missing.push({ id: product.id, handle: product.handle })
      }
    }
    if (offset + products.length >= count) break
  }

  if (!missing.length) {
    log("exists", `${category.name}: every product of ${handles.join(", ")}`)
    return
  }
  await sdk.admin.productCategory.updateProducts(category.id, { add: missing.map((p) => p.id) })
  log("updated", `${category.name}: added ${missing.map((p) => p.handle).join(", ")}`)
}

for (let rank = 0; rank < CATEGORIES.length; rank++) {
  const def = CATEGORIES[rank]!
  const category = await ensureCategory(def, rank)
  if (def.collections) await addCollectionProducts(category, def.collections)
}
