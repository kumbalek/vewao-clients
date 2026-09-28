import type { SnapshotImage } from "./sanity.ts"

/**
 * The Content plugin's Admin API, for additive and idempotent imports: things
 * that exist are left alone so admin edits survive; only missing collections,
 * fields, items, tags and select options are added.
 */

export type FieldDef = {
  name: string
  label: string
  field_type: "text" | "rich_text" | "number" | "boolean" | "date" | "select" | "image"
  options?: { values: string[] }
}

export type CollectionDef = {
  label: string
  slug: string
  format: "md" | "text" | "html" | "json" | "img"
  fields: FieldDef[]
}

type Field = { id: string; name: string; options: { values?: string[] } | null }

const MAX_IMAGE_WIDTH = 1600

export function log(action: "created" | "exists" | "updated", what: string) {
  console.log(`${action.padEnd(7)} ${what}`)
}

export function connect() {
  const baseUrl = process.env.MEDUSA_BACKEND_URL?.replace(/\/$/, "")
  const apiKey = process.env.MEDUSA_ADMIN_API_KEY
  if (!baseUrl || !apiKey?.startsWith("sk_")) {
    throw new Error("Set MEDUSA_BACKEND_URL and a secret MEDUSA_ADMIN_API_KEY (sk_...).")
  }
  const authorization = `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`

  async function admin<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const isForm = init.body instanceof FormData
    const response = await fetch(`${baseUrl}${path}`, {
      method: init.method ?? "GET",
      headers: {
        authorization,
        ...(isForm || init.body === undefined ? {} : { "content-type": "application/json" }),
      },
      body: isForm
        ? (init.body as FormData)
        : init.body === undefined
          ? undefined
          : JSON.stringify(init.body),
    })
    const text = await response.text()
    if (!response.ok) throw new Error(`${init.method ?? "GET"} ${path}: HTTP ${response.status} ${text}`)
    return JSON.parse(text) as T
  }

  async function collections() {
    const { content_collections } = await admin<{
      content_collections: { id: string; slug: string }[]
    }>("/admin/content?limit=100")
    return content_collections
  }

  async function itemSlugs(collectionId: string): Promise<Map<string, string>> {
    const { content_items } = await admin<{ content_items: { id: string; slug: string }[] }>(
      `/admin/content/${collectionId}/items?limit=1000&fields=id,slug`
    )
    return new Map(content_items.map((item) => [item.slug, item.id]))
  }

  async function ensureFields(collectionId: string, defs: FieldDef[]) {
    const { fields } = await admin<{ fields: Field[] }>(`/admin/content/${collectionId}/fields?limit=50`)
    for (const [sort_order, def] of defs.entries()) {
      const existing = fields.find((f) => f.name === def.name)
      if (!existing) {
        await admin(`/admin/content/${collectionId}/fields`, {
          method: "POST",
          body: { ...def, required: false, sort_order },
        })
        log("created", `field ${def.name}`)
        continue
      }
      // A select must offer every value the import uses; keep the admin's own.
      const current = existing.options?.values ?? []
      const missing = (def.options?.values ?? []).filter((v) => !current.includes(v))
      if (missing.length) {
        await admin(`/admin/content/${collectionId}/fields/${existing.id}`, {
          method: "POST",
          body: { options: { ...existing.options, values: [...current, ...missing] } },
        })
        log("updated", `field ${def.name} options (+${missing.join(", ")})`)
      }
    }
  }

  return {
    /** The collection's id; creates it and any missing fields. */
    async ensureCollection(def: CollectionDef): Promise<string> {
      let id = (await collections()).find((c) => c.slug === def.slug)?.id
      if (id) {
        log("exists", `collection ${def.slug}`)
      } else {
        const { fields: _fields, ...body } = def
        const { content_collection } = await admin<{ content_collection: { id: string } }>(
          "/admin/content",
          { method: "POST", body: { ...body, prefix: def.slug } }
        )
        id = content_collection.id
        log("created", `collection ${def.slug}`)
      }
      await ensureFields(id, def.fields)
      return id
    },

    itemSlugs,

    /**
     * The storefront's detail route finds items by slug across all collections,
     * so a slug must be unique site-wide. Throws before anything is written.
     */
    async assertSlugsAvailable(collectionSlug: string, slugs: string[]) {
      for (const collection of await collections()) {
        if (collection.slug === collectionSlug) continue
        const existing = await itemSlugs(collection.id)
        const clashes = slugs.filter((slug) => existing.has(slug))
        if (clashes.length) {
          throw new Error(`Slugs already used in "${collection.slug}": ${clashes.join(", ")}`)
        }
      }
    },

    /** Download (capped width, original format) and store in Medusa; returns the URL. */
    async upload(collectionId: string, image: SnapshotImage, name: string): Promise<string> {
      const source = await fetch(`${image.url}?w=${MAX_IMAGE_WIDTH}&fit=max`)
      if (!source.ok) throw new Error(`${image.url}: HTTP ${source.status}`)
      const type = source.headers.get("content-type") ?? "application/octet-stream"
      const form = new FormData()
      form.append(
        "files",
        new Blob([await source.arrayBuffer()], { type }),
        `${name}.${image.url.split(".").pop()}`
      )
      const { files } = await admin<{ files: { url: string }[] }>(
        `/admin/content/${collectionId}/upload`,
        { method: "POST", body: form }
      )
      return files[0].url
    },

    async createItem(collectionId: string, body: Record<string, unknown>): Promise<string> {
      const { content_item } = await admin<{ content_item: { id: string } }>(
        `/admin/content/${collectionId}/items`,
        // Explicit null: the plugin stamps "now" on publish when it is omitted.
        { method: "POST", body: { status: "published", published_at: null, ...body } }
      )
      return content_item.id
    },

    async ensureTags(collectionId: string, itemId: string, values: string[], itemSlug: string) {
      const { tags } = await admin<{ tags: { value: string }[] }>(
        `/admin/content/${collectionId}/items/${itemId}/tags?limit=50`
      )
      for (const value of values) {
        if (tags.some((t) => t.value === value)) continue
        await admin(`/admin/content/${collectionId}/items/${itemId}/tags`, {
          method: "POST",
          body: { value },
        })
        log("created", `tag ${value} on ${itemSlug}`)
      }
    },
  }
}
