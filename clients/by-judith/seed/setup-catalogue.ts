import Medusa from "@medusajs/js-sdk"
import { readFileSync } from "node:fs"

import type { DpCatalogue, DpProduct } from "./extract-dp.ts"
import { eurFromCzk, HERB_EUR_PRICES, ownerEurPriceUpdate } from "./pricing.ts"

/**
 * The new shop's catalogue (vewao-clients#64): product categories, the owner's
 * EUR prices for the herbs, the clinic's procedures sold as vouchers, and the
 * DP Dermaceuticals range from the clinic's old shop (dp-catalogue.json, made
 * by extract-dp.ts) under its subcategories. Production gets the
 * catalogue prepared on localhost and dev, without a legacy migration (D23);
 * this script sets up the same structure on any other backend.
 *
 * Additive and idempotent: it creates what is missing and never deletes. The
 * only changes to existing records: the owner's EUR price replaces a missing or
 * dev-placeholder one (a price set in admin stays), an untyped procedure gets
 * the voucher type, and a product joins a category it is listed in.
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

type Price = { czk: number; eur: number }

/** One price, or variants under one option (e.g. Ultherapy's treated areas). */
type VoucherProductDef = {
  title: string
  handle: string
  /** Category handle. */
  category: string
} & (Price | { option: string; variants: (Price & { title: string })[] })

/**
 * The clinic's procedures and consultations, sold as vouchers (owner,
 * 2026-11-22): the voucher type makes vewao-platform's voucher plugin issue,
 * e-mail and redeem a voucher per unit, titled after the product (and variant).
 * No shipping profile and no inventory, so a cart of vouchers skips delivery
 * and pays through Comgate. Drafts until their texts are written in Payload.
 */
export const VOUCHER_PRODUCTS: VoucherProductDef[] = [
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
  {
    title: "Modelace a hydratace rtů Lips by Boris Jegorov",
    handle: "modelace-a-hydratace-rtu-lips-by-boris-jegorov",
    category: "estetika",
    czk: 7900,
    eur: 316,
  },
  {
    title: "Vyhlazení mimických vrásek – Baby Botox",
    handle: "vyhlazeni-mimickych-vrasek-baby-botox",
    category: "estetika",
    czk: 6900,
    eur: 276,
  },
  {
    title: "Blefaroplastika",
    handle: "blefaroplastika",
    category: "estetika",
    czk: 17000,
    eur: 680,
  },
  {
    title: "Osobní konzultace s MUDr. Jegorovem",
    handle: "osobni-konzultace-s-mudr-jegorovem",
    category: "estetika",
    czk: 2000,
    eur: 80,
  },
  {
    title: "Osobní konzultace s pleťovou terapeutkou",
    handle: "osobni-konzultace-s-pletovou-terapeutkou",
    category: "estetika",
    czk: 1000,
    eur: 40,
  },
  {
    title: "Aplikace na jednotlivé partie",
    handle: "ultherapy-aplikace-na-jednotlive-partie",
    category: "ultherapy",
    option: "Partie",
    // The owner gave CZK per area and "od 240 EUR"; like all their prices, EUR = Kč ÷ 25.
    variants: [
      { title: "Brow lift", czk: 6000, eur: 240 },
      { title: "Brow lift a oční okolí", czk: 12000, eur: 480 },
      { title: "Lower face", czk: 22000, eur: 880 },
      { title: "Horní část krku/podbradek", czk: 15000, eur: 600 },
      { title: "Krk", czk: 15000, eur: 600 },
      { title: "Dekolt", czk: 17000, eur: 680 },
    ],
  },
  {
    title: "Facelift (tváře + horní část krku/podbradek)",
    handle: "ultherapy-facelift",
    category: "ultherapy",
    czk: 35000,
    eur: 1400,
  },
  {
    title: "Full facelift (facelift s browliftem)",
    handle: "ultherapy-full-facelift",
    category: "ultherapy",
    czk: 40000,
    eur: 1600,
  },
]

const DEFAULT_OPTION = { title: "Default option", value: "Default option value" }

/** vewao-platform's voucher product type (its VOUCHER_PRODUCT_TYPE, "Dárkový poukaz" by default). */
const VOUCHER_TYPE = "Dárkový poukaz"
/** Physical goods ship from the clinic; stock starts at 0 until the merchant counts it. */
const STOCK_LOCATION = "Beauty Body Clinic"
const DP_PARENT = "dp-dermaceuticals"

const dp = JSON.parse(readFileSync(new URL("./dp-catalogue.json", import.meta.url), "utf8")) as DpCatalogue

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

async function ensureCategory(def: CategoryDef, rank: number, parentId?: string) {
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
    ...(parentId ? { parent_category_id: parentId } : {}),
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

/** The voucher product type, created if the backend has none yet. */
async function ensureVoucherType() {
  const { product_types } = await sdk.admin.productType.list({ value: VOUCHER_TYPE, fields: "id,value" })
  if (product_types[0]) return product_types[0].id
  const { product_type } = await sdk.admin.productType.create({ value: VOUCHER_TYPE })
  log("created", `product type ${VOUCHER_TYPE}`)
  return product_type.id
}

/**
 * Creates a missing voucher product as a draft. An existing one keeps
 * everything, except that it gets the voucher type if it has no type.
 */
async function ensureVoucherProduct(
  def: VoucherProductDef,
  categoryId: string,
  salesChannelIds: string[],
  voucherTypeId: string
) {
  const { products } = await sdk.admin.product.list({ handle: def.handle, fields: "id,title,status,type_id" })
  const existing = products[0]
  if (existing) {
    if (!existing.type_id) {
      await sdk.admin.product.update(existing.id, { type_id: voucherTypeId })
      log("updated", `product ${existing.title}: sold as a voucher`)
    } else if (existing.type_id !== voucherTypeId) {
      log("warning", `product ${existing.title} has another type; it is not sold as a voucher`)
    } else {
      log("exists", `product ${existing.title} (${existing.status}, voucher)`)
    }
    return
  }
  // A single price is one variant under Medusa's default option.
  const option = "variants" in def ? def.option : DEFAULT_OPTION.title
  const variants =
    "variants" in def
      ? def.variants.map((v) => ({ ...v, value: v.title }))
      : [{ title: def.title, czk: def.czk, eur: def.eur, value: DEFAULT_OPTION.value }]
  await sdk.admin.product.create({
    title: def.title,
    handle: def.handle,
    status: "draft",
    type_id: voucherTypeId,
    categories: [{ id: categoryId }],
    sales_channels: salesChannelIds.map((id) => ({ id })),
    options: [{ title: option, values: variants.map((v) => v.value) }],
    variants: variants.map((v, rank) => ({
      title: v.title,
      // The owner's order, in admin and in the shop's selector.
      variant_rank: rank,
      manage_inventory: false,
      allow_backorder: false,
      options: { [option]: v.value },
      prices: [
        { currency_code: "czk", amount: v.czk },
        { currency_code: "eur", amount: v.eur },
      ],
    })),
  })
  const prices = variants.map((v) => `${v.czk} Kč / ${v.eur} €`).join(", ")
  log("created", `product ${def.title} (draft voucher, ${prices})`)
}

/** Uploads the product's image from the old shop to this backend's file storage. */
async function uploadImage(url: string, handle: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (vewao catalogue import)" } })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const type = response.headers.get("content-type") ?? "image/jpeg"
    const extension = new URL(url).pathname.split(".").pop() ?? "jpg"
    const form = new FormData()
    form.append("files", new File([await response.arrayBuffer()], `${handle}.${extension}`, { type }))
    // sdk.admin.upload.create checks `instanceof FileList`, which Node lacks: send its request directly.
    const { files } = await sdk.client.fetch<{ files: { url: string }[] }>("/admin/uploads", {
      method: "POST",
      headers: { "content-type": null },
      body: form,
    })
    return files[0]?.url
  } catch (error) {
    log("warning", `${handle}: image not uploaded (${error instanceof Error ? error.message : error})`)
    return undefined
  }
}

/**
 * Creates a missing DP Dermaceuticals product as a draft: shipped goods with a
 * shipping profile and managed stock, the old shop's codes as SKUs, EUR at
 * Kč ÷ 25. An existing product is left as it is, except that it gets the old
 * shop's image if it has none.
 */
async function ensureDpProduct(
  p: DpProduct,
  categoryIds: string[],
  salesChannelIds: string[],
  shippingProfileId: string
): Promise<string> {
  const { products } = await sdk.admin.product.list({ handle: p.handle, fields: "id,title,status,thumbnail" })
  const existing = products[0]
  if (existing) {
    const image = !existing.thumbnail && p.image ? await uploadImage(p.image, p.handle) : undefined
    if (image) {
      await sdk.admin.product.update(existing.id, { thumbnail: image, images: [{ url: image }] })
      log("updated", `product ${existing.title}: image from the old shop`)
    } else {
      log("exists", `product ${existing.title} (${existing.status})`)
    }
    return existing.id
  }
  const option = p.option ?? DEFAULT_OPTION.title
  const image = p.image ? await uploadImage(p.image, p.handle) : undefined
  const { product } = await sdk.admin.product.create({
    title: p.title,
    handle: p.handle,
    status: "draft",
    categories: categoryIds.map((id) => ({ id })),
    sales_channels: salesChannelIds.map((id) => ({ id })),
    shipping_profile_id: shippingProfileId,
    ...(image ? { thumbnail: image, images: [{ url: image }] } : {}),
    metadata: { source_url: p.source_url, ...(p.image ? { source_image: p.image } : {}) },
    options: [{ title: option, values: p.option ? p.variants.map((v) => v.title) : [DEFAULT_OPTION.value] }],
    variants: p.variants.map((v, rank) => ({
      title: v.title,
      sku: v.sku,
      variant_rank: rank,
      manage_inventory: true,
      allow_backorder: false,
      options: { [option]: p.option ? v.title : DEFAULT_OPTION.value },
      prices: [
        { currency_code: "czk", amount: v.price_czk },
        { currency_code: "eur", amount: eurFromCzk(v.price_czk) },
      ],
    })),
  })
  const prices = p.variants.map((v) => `${v.price_czk} Kč / ${eurFromCzk(v.price_czk)} €`).join(", ")
  log("created", `product ${p.title} (draft, ${prices}${image ? "" : ", no image"})`)
  return product.id
}

/** Adds listed products missing from the category; products already in it stay. */
async function addProducts(category: { id: string; name: string }, productIds: string[]) {
  const { products } = await sdk.admin.product.list({
    id: productIds,
    fields: "id,handle,*categories",
    limit: productIds.length,
  })
  const missing = products.filter((p) => !p.categories?.some((c) => c?.id === category.id))
  if (!missing.length) return
  await sdk.admin.productCategory.updateProducts(category.id, { add: missing.map((p) => p.id) })
  log("updated", `${category.name}: added ${missing.map((p) => p.handle).join(", ")}`)
}

/** A stock level of 0 at the clinic for every SKU that has none there. */
async function ensureStockLevels(skus: string[]) {
  const { stock_locations } = await sdk.admin.stockLocation.list({ name: STOCK_LOCATION, fields: "id,name" })
  const location = stock_locations[0]
  if (!location) {
    log("warning", `stock location ${STOCK_LOCATION} not found; DP stock levels not created`)
    return
  }
  let created = 0
  for (const sku of skus) {
    const { inventory_items } = await sdk.admin.inventoryItem.list({ sku, fields: "id,sku,*location_levels" })
    const item = inventory_items[0]
    if (!item) {
      log("warning", `no inventory item for SKU ${sku}`)
      continue
    }
    if (item.location_levels?.some((level) => level.location_id === location.id)) continue
    await sdk.admin.inventoryItem.batchInventoryItemLocationLevels(item.id, {
      create: [{ location_id: location.id, stocked_quantity: 0 }],
    })
    created++
  }
  log(created ? "created" : "exists", `stock levels at ${STOCK_LOCATION}: ${created} new (0 in stock)`)
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
const salesChannelIds = sales_channels.map((channel) => channel.id)

const voucherTypeId = await ensureVoucherType()
for (const def of VOUCHER_PRODUCTS) {
  const categoryId = categoryIds.get(def.category)
  if (!categoryId) throw new Error(`Unknown category ${def.category} for ${def.handle}`)
  await ensureVoucherProduct(def, categoryId, salesChannelIds, voucherTypeId)
}

// DP Dermaceuticals: the old shop's subcategories under DP_PARENT, then its products.
const dpParent = categoryIds.get(DP_PARENT)
if (!dpParent) throw new Error(`Category ${DP_PARENT} missing`)
const dpCategories: { id: string; name: string; products: string[] }[] = []
for (let rank = 0; rank < dp.categories.length; rank++) {
  const c = dp.categories[rank]!
  const category = await ensureCategory({ name: c.title, handle: c.handle }, rank, dpParent)
  dpCategories.push({ id: category.id, name: c.title, products: c.products })
}
const { shipping_profiles } = await sdk.admin.shippingProfile.list({ type: "default", fields: "id" })
const shippingProfileId = shipping_profiles[0]?.id
if (!shippingProfileId) throw new Error("No default shipping profile; run the dev seed or create one in admin")
const dpProductIds = new Map<string, string>()
for (const p of dp.products) {
  const inCategories = dpCategories.filter((c) => c.products.includes(p.handle)).map((c) => c.id)
  dpProductIds.set(p.handle, await ensureDpProduct(p, inCategories, salesChannelIds, shippingProfileId))
}
for (const c of dpCategories) {
  await addProducts(c, c.products.map((handle) => dpProductIds.get(handle)!))
}
await ensureStockLevels(dp.products.flatMap((p) => p.variants.map((v) => v.sku)))
