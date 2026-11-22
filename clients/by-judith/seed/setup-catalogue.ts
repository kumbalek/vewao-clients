import Medusa from "@medusajs/js-sdk"

import { HERB_EUR_PRICES, ownerEurPriceUpdate } from "./pricing.ts"

/**
 * The new shop's catalogue structure (vewao-clients#64): product categories,
 * the owner's EUR prices for the herbs, then placeholder products as the owner
 * lists them. Production gets the
 * catalogue prepared on localhost and dev, without a legacy migration (D23);
 * this script sets up the same structure on any other backend.
 *
 * Additive and idempotent: it creates what is missing and never deletes. The
 * only change to existing records is the owner's EUR price replacing a missing
 * or dev-placeholder one; a price set in admin stays.
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

type ServiceDef = {
  title: string
  handle: string
  /** Category handle. */
  category: string
  czk: number
  eur: number
}

/**
 * Services sold in the shop (owner, 2026-11-22). No shipping profile and no
 * inventory, like the gift vouchers: a cart of services skips delivery and pays
 * through Comgate. One variant each; created as drafts until their texts are
 * written in Payload.
 */
export const SERVICES: ServiceDef[] = [
  {
    title: "Vstupní osobní diagnostika Judity Halvové",
    handle: "vstupni-osobni-diagnostika-judity-halvove",
    category: "tcm",
    czk: 3000,
    eur: 120,
  },
  {
    title: "Balíček 5× akupunktura u senior terapeuta",
    handle: "balicek-5x-akupunktura-u-senior-terapeuta",
    category: "tcm",
    czk: 15000,
    eur: 600,
  },
  {
    title: "Online konzultace fytoterapie s Juditou Halvovou",
    handle: "online-konzultace-fytoterapie-s-juditou-halvovou",
    category: "tcm",
    czk: 1500,
    eur: 60,
  },
  {
    title: "Online konzultace fytoterapie s naší specialistkou Lucií",
    handle: "online-konzultace-fytoterapie-s-nasi-specialistkou-lucii",
    category: "tcm",
    czk: 1000,
    eur: 40,
  },
]

const DEFAULT_OPTION = { title: "Default option", value: "Default option value" }

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

/** The owner's EUR price on every variant of the herb lines (Gold 75 €, Acute 24 €). */
async function ensureHerbEurPrices() {
  const lines = Object.keys(HERB_EUR_PRICES)
  const { collections } = await sdk.admin.productCollection.list({ handle: lines, fields: "id,handle" })
  for (const collection of collections) {
    const ownerEur = HERB_EUR_PRICES[collection.handle]!
    const { products, count } = await sdk.admin.product.list({
      collection_id: [collection.id],
      fields: "id,handle,variants.id,*variants.prices",
      limit: 200,
    })
    if (count > products.length) throw new Error(`More than ${products.length} products in ${collection.handle}`)
    for (const product of products) {
      for (const variant of product.variants ?? []) {
        const prices = variant.prices ?? []
        const eur = prices.find((price) => price.currency_code === "eur")
        const czk = prices.find((price) => price.currency_code === "czk")?.amount
        if (czk == null) {
          log("warning", `${product.handle}: no CZK price, EUR left as it is`)
          continue
        }
        const amount = ownerEurPriceUpdate(eur?.amount, czk, ownerEur)
        if (amount === undefined) {
          if (eur?.amount === ownerEur) log("exists", `${product.handle}: ${ownerEur} €`)
          else log("warning", `${product.handle}: keeps ${eur?.amount} € set in admin (owner's price ${ownerEur} €)`)
          continue
        }
        // A variant's prices are replaced as a set: keep the others as they are.
        await sdk.admin.product.updateVariant(product.id, variant.id, {
          prices: [
            ...prices
              .filter((price) => price.currency_code !== "eur")
              .map((price) => ({ id: price.id, currency_code: price.currency_code, amount: price.amount })),
            { ...(eur ? { id: eur.id } : {}), currency_code: "eur", amount },
          ],
        })
        log("updated", `${product.handle}: ${eur?.amount ?? "no"} € → ${amount} €`)
      }
    }
  }
}

/** Creates a missing service as a draft; an existing product is left as it is. */
async function ensureService(def: ServiceDef, categoryId: string, salesChannelIds: string[]) {
  const { products } = await sdk.admin.product.list({ handle: def.handle, fields: "id,title,status" })
  if (products[0]) {
    log("exists", `product ${products[0].title} (${products[0].status})`)
    return
  }
  await sdk.admin.product.create({
    title: def.title,
    handle: def.handle,
    status: "draft",
    categories: [{ id: categoryId }],
    sales_channels: salesChannelIds.map((id) => ({ id })),
    options: [{ title: DEFAULT_OPTION.title, values: [DEFAULT_OPTION.value] }],
    variants: [
      {
        title: def.title,
        manage_inventory: false,
        allow_backorder: false,
        options: { [DEFAULT_OPTION.title]: DEFAULT_OPTION.value },
        prices: [
          { currency_code: "czk", amount: def.czk },
          { currency_code: "eur", amount: def.eur },
        ],
      },
    ],
  })
  log("created", `product ${def.title} (draft, ${def.czk} Kč, ${def.eur} €)`)
}

const categoryIds = new Map<string, string>()
for (let rank = 0; rank < CATEGORIES.length; rank++) {
  const def = CATEGORIES[rank]!
  const category = await ensureCategory(def, rank)
  categoryIds.set(def.handle, category.id)
  if (def.collections) await addCollectionProducts(category, def.collections)
}
await ensureHerbEurPrices()

const { sales_channels } = await sdk.admin.salesChannel.list({ fields: "id", limit: 50 })
for (const service of SERVICES) {
  const categoryId = categoryIds.get(service.category)
  if (!categoryId) throw new Error(`Unknown category ${service.category} for ${service.handle}`)
  await ensureService(service, categoryId, sales_channels.map((channel) => channel.id))
}
