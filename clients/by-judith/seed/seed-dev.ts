import Medusa from "@medusajs/js-sdk"
import type { HttpTypes } from "@medusajs/types"
import { readFileSync } from "node:fs"

/**
 * Local/dev seed for By Judith: clinic pickup, PPL delivery, the legacy
 * catalogue snapshot and dev stock, created through the Admin API.
 *
 * Idempotent and additive: it creates what is missing and leaves existing
 * records alone, so admin edits on dev survive a re-run. It builds on the
 * platform seed's region, sales channel and publishable key. Production
 * data comes from the migration, never from this script.
 */

type CatalogueProduct = {
  handle: string
  title: string
  subtitle: string | null
  description: string
  collection: string | null
  thumbnail: string | null
  images: string[]
  metadata: Record<string, unknown>
  variant: { title: string; sku: string; price_czk: number }
}

type Catalogue = {
  collections: { handle: string; title: string }[]
  products: CatalogueProduct[]
}

type ShippingSpec = {
  set: string
  type: "pickup" | "shipping"
  zone: string
  option: string
  code: string
  prices: HttpTypes.AdminCreateShippingOption["prices"]
}

const CURRENCY = "czk"
const COUNTRY = "cz"
const SALES_CHANNEL = process.env.SEED_SALES_CHANNEL ?? "Local storefront"
const DEV_STOCK = 100
const FREE_DELIVERY_FROM = 5000
const DEFAULT_OPTION = { title: "Default option", value: "Default option value" }

const LOCATION = {
  name: "Beauty Body Clinic",
  address: {
    company: "Beauty Body Clinic",
    address_1: "Kosmická 19",
    postal_code: "149 00",
    city: "Praha 4 - Háje",
    country_code: COUNTRY,
  },
}

// Launch methods agreed on 2026-09-24: clinic pickup and PPL delivery, both
// fulfilled manually. Pay-on-site is offered only for the pickup set.
const SHIPPING: ShippingSpec[] = [
  {
    set: "Beauty Body Clinic pick up",
    type: "pickup",
    zone: "Osobní odběr",
    option: "Pobočka Beauty Body Clinic",
    code: "clinic-pickup",
    prices: [{ currency_code: CURRENCY, amount: 0 }],
  },
  {
    set: "Beauty Body Clinic shipping",
    type: "shipping",
    zone: "Doprava na adresu",
    option: "Přepravce PPL",
    code: "ppl",
    // Medusa 2.20.1 identifies a price by rule attribute and value but not
    // operator, so `lt 5000` plus `gte 5000` silently keeps only one price.
    // Distinct values avoid that; the sub-haléř overlap never leaves a gap.
    prices: [
      {
        currency_code: CURRENCY,
        amount: 150,
        rules: [{ attribute: "item_total", operator: "lt", value: FREE_DELIVERY_FROM }],
      },
      {
        currency_code: CURRENCY,
        amount: 0,
        rules: [{ attribute: "item_total", operator: "gt", value: FREE_DELIVERY_FROM - 0.01 }],
      },
    ],
  },
]

function createClient() {
  const baseUrl = process.env.MEDUSA_BACKEND_URL
  const apiKey = process.env.MEDUSA_ADMIN_API_KEY
  if (!baseUrl || !apiKey?.startsWith("sk_")) {
    throw new Error("Set MEDUSA_BACKEND_URL and a secret MEDUSA_ADMIN_API_KEY (sk_...).")
  }
  const host = new URL(baseUrl).hostname
  if (host === "by-judith.com" || host.endsWith(".by-judith.com")) {
    throw new Error(`Refusing to seed ${host}: production data comes from the migration.`)
  }
  return new Medusa({ baseUrl, apiKey })
}

const sdk = createClient()

function log(action: "created" | "exists" | "updated", what: string) {
  console.log(`${action.padEnd(7)} ${what}`)
}

async function findSalesChannel() {
  const { sales_channels } = await sdk.admin.salesChannel.list({ name: SALES_CHANNEL })
  const channel = sales_channels[0]
  if (!channel) {
    throw new Error(`Sales channel "${SALES_CHANNEL}" not found; run the platform seed first.`)
  }
  return channel
}

async function findRegion() {
  const { regions } = await sdk.admin.region.list({ fields: "id,name,currency_code,*countries" })
  const region = regions.find(
    (r) => r.currency_code === CURRENCY && r.countries?.some((c) => c.iso_2 === COUNTRY)
  )
  if (!region) {
    throw new Error("No CZK region for CZ found; run the platform seed first.")
  }
  return region
}

/** Shop prices are consumer prices including VAT, as in the legacy shop. */
async function ensureTaxInclusivePrices(regionId: string) {
  const wanted = [
    { attribute: "currency_code", value: CURRENCY },
    { attribute: "region_id", value: regionId },
  ]
  const { price_preferences } = await sdk.admin.pricePreference.list({ limit: 100 })
  for (const { attribute, value } of wanted) {
    const existing = price_preferences.find((p) => p.attribute === attribute && p.value === value)
    if (!existing) {
      await sdk.admin.pricePreference.create({ attribute, value, is_tax_inclusive: true })
      log("created", `tax-inclusive price preference ${attribute}=${value}`)
    } else if (!existing.is_tax_inclusive) {
      await sdk.admin.pricePreference.update(existing.id, { is_tax_inclusive: true })
      log("updated", `price preference ${attribute}=${value} to tax-inclusive`)
    } else {
      log("exists", `tax-inclusive price preference ${attribute}=${value}`)
    }
  }
}

const LOCATION_FIELDS =
  "id,name,*fulfillment_providers,*sales_channels,*fulfillment_sets,*fulfillment_sets.service_zones"

async function retrieveLocation(id: string) {
  const { stock_location } = await sdk.admin.stockLocation.retrieve(id, { fields: LOCATION_FIELDS })
  return stock_location
}

async function ensureLocation(salesChannelId: string) {
  const { stock_locations } = await sdk.admin.stockLocation.list({ name: LOCATION.name })
  let id = stock_locations[0]?.id
  if (!id) {
    const { stock_location } = await sdk.admin.stockLocation.create(LOCATION)
    id = stock_location.id
    log("created", `stock location ${LOCATION.name}`)
  } else {
    log("exists", `stock location ${LOCATION.name}`)
  }

  const location = await retrieveLocation(id)
  if (!location.fulfillment_providers?.some((p) => p?.id === "manual_manual")) {
    await sdk.admin.stockLocation.updateFulfillmentProviders(id, { add: ["manual_manual"] })
    log("created", "manual fulfilment provider link")
  }
  if (!location.sales_channels?.some((c) => c?.id === salesChannelId)) {
    await sdk.admin.stockLocation.updateSalesChannels(id, { add: [salesChannelId] })
    log("created", `sales channel link ${SALES_CHANNEL}`)
  }
  return id
}

async function ensureShippingProfile() {
  const { shipping_profiles } = await sdk.admin.shippingProfile.list({ type: "default" })
  if (shipping_profiles[0]) {
    return shipping_profiles[0].id
  }
  const { shipping_profile } = await sdk.admin.shippingProfile.create({
    name: "Default Shipping Profile",
    type: "default",
  })
  log("created", "default shipping profile")
  return shipping_profile.id
}

async function ensureShipping(locationId: string, shippingProfileId: string) {
  for (const spec of SHIPPING) {
    let set = (await retrieveLocation(locationId)).fulfillment_sets?.find((s) => s?.name === spec.set)
    if (!set) {
      await sdk.admin.stockLocation.createFulfillmentSet(locationId, { name: spec.set, type: spec.type })
      set = (await retrieveLocation(locationId)).fulfillment_sets?.find((s) => s?.name === spec.set)
      log("created", `fulfillment set ${spec.set}`)
    }
    if (!set) {
      throw new Error(`Fulfillment set ${spec.set} was not created`)
    }

    let zone = set.service_zones?.find((z) => z?.name === spec.zone)
    if (!zone) {
      const { fulfillment_set } = await sdk.admin.fulfillmentSet.createServiceZone(set.id, {
        name: spec.zone,
        geo_zones: [{ type: "country", country_code: COUNTRY }],
      })
      zone = fulfillment_set.service_zones?.find((z) => z?.name === spec.zone)
      log("created", `service zone ${spec.zone}`)
    }
    if (!zone) {
      throw new Error(`Service zone ${spec.zone} was not created`)
    }

    const { shipping_options } = await sdk.admin.shippingOption.list({ service_zone_id: zone.id })
    if (shipping_options.some((o) => o.name === spec.option)) {
      log("exists", `shipping option ${spec.option}`)
      continue
    }
    await sdk.admin.shippingOption.create({
      name: spec.option,
      service_zone_id: zone.id,
      shipping_profile_id: shippingProfileId,
      provider_id: "manual_manual",
      price_type: "flat",
      type: { label: spec.option, code: spec.code },
      prices: spec.prices,
      rules: [
        { attribute: "enabled_in_store", operator: "eq", value: "true" },
        { attribute: "is_return", operator: "eq", value: "false" },
      ],
    })
    log("created", `shipping option ${spec.option}`)
  }
}

async function ensureCollections(catalogue: Catalogue) {
  const ids = new Map<string, string>()
  for (const { handle, title } of catalogue.collections) {
    const { collections } = await sdk.admin.productCollection.list({ handle })
    let id = collections[0]?.id
    if (!id) {
      const { collection } = await sdk.admin.productCollection.create({ handle, title })
      id = collection.id
      log("created", `collection ${title}`)
    } else {
      log("exists", `collection ${title}`)
    }
    ids.set(handle, id)
  }
  return ids
}

async function ensureProducts(
  catalogue: Catalogue,
  collections: Map<string, string>,
  salesChannelId: string,
  shippingProfileId: string
) {
  for (const p of catalogue.products) {
    const { products } = await sdk.admin.product.list({ handle: p.handle })
    if (products.length) {
      log("exists", `product ${p.title}`)
      continue
    }
    await sdk.admin.product.create({
      title: p.title,
      handle: p.handle,
      subtitle: p.subtitle,
      description: p.description,
      status: "published",
      thumbnail: p.thumbnail,
      images: p.images.map((url) => ({ url })),
      collection_id: p.collection ? collections.get(p.collection) : undefined,
      metadata: p.metadata,
      sales_channels: [{ id: salesChannelId }],
      shipping_profile_id: shippingProfileId,
      options: [{ title: DEFAULT_OPTION.title, values: [DEFAULT_OPTION.value] }],
      variants: [
        {
          title: p.variant.title,
          sku: p.variant.sku,
          manage_inventory: true,
          allow_backorder: false,
          options: { [DEFAULT_OPTION.title]: DEFAULT_OPTION.value },
          prices: [{ currency_code: CURRENCY, amount: p.variant.price_czk }],
        },
      ],
    })
    log("created", `product ${p.title} (${p.variant.sku}, ${p.variant.price_czk} Kč)`)
  }
}

async function ensureStock(catalogue: Catalogue, locationId: string) {
  for (const { variant } of catalogue.products) {
    const { inventory_items } = await sdk.admin.inventoryItem.list({
      sku: variant.sku,
      fields: "id,sku,*location_levels",
    })
    const item = inventory_items[0]
    if (!item) {
      throw new Error(`No inventory item for SKU ${variant.sku}`)
    }
    if (item.location_levels?.some((level) => level.location_id === locationId)) {
      log("exists", `stock level for SKU ${variant.sku}`)
      continue
    }
    await sdk.admin.inventoryItem.batchInventoryItemLocationLevels(item.id, {
      create: [{ location_id: locationId, stocked_quantity: DEV_STOCK }],
    })
    log("created", `stock level for SKU ${variant.sku}: ${DEV_STOCK}`)
  }
}

async function main() {
  const catalogue = JSON.parse(
    readFileSync(new URL("./catalogue.json", import.meta.url), "utf8")
  ) as Catalogue

  const salesChannel = await findSalesChannel()
  const region = await findRegion()
  await ensureTaxInclusivePrices(region.id)
  const locationId = await ensureLocation(salesChannel.id)
  const shippingProfileId = await ensureShippingProfile()
  await ensureShipping(locationId, shippingProfileId)
  const collections = await ensureCollections(catalogue)
  await ensureProducts(catalogue, collections, salesChannel.id, shippingProfileId)
  await ensureStock(catalogue, locationId)
  console.log("By Judith dev seed complete.")
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
