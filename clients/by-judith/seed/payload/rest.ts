/**
 * Payload's REST API inside the storefront, for imports. Signs in with a CMS
 * account (PAYLOAD_EMAIL/PAYLOAD_PASSWORD) or a user's API key (PAYLOAD_API_KEY).
 */

export type Doc = { id: number; [key: string]: unknown }

export function connectPayload() {
  const baseUrl = process.env.PAYLOAD_URL?.replace(/\/+$/, "")
  if (!baseUrl) throw new Error("Set PAYLOAD_URL to the storefront, e.g. https://judith-dev.vewao.link")
  const apiKey = process.env.PAYLOAD_API_KEY
  let authorization = apiKey ? `users API-Key ${apiKey}` : ""

  async function request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const isForm = init.body instanceof FormData
    const response = await fetch(`${baseUrl}${path}`, {
      method: init.method ?? "GET",
      headers: {
        ...(authorization ? { authorization } : {}),
        ...(isForm || init.body === undefined ? {} : { "content-type": "application/json" }),
      },
      body: isForm ? (init.body as FormData) : init.body === undefined ? undefined : JSON.stringify(init.body),
    })
    const text = await response.text()
    if (!response.ok) throw new Error(`${init.method ?? "GET"} ${path}: HTTP ${response.status} ${text.slice(0, 500)}`)
    return JSON.parse(text) as T
  }

  return {
    baseUrl,

    async signIn(): Promise<void> {
      if (authorization) return
      const email = process.env.PAYLOAD_EMAIL
      const password = process.env.PAYLOAD_PASSWORD
      if (!email || !password) throw new Error("Set PAYLOAD_API_KEY, or PAYLOAD_EMAIL and PAYLOAD_PASSWORD.")
      const { token } = await request<{ token: string }>("/api/users/login", {
        method: "POST",
        body: { email, password },
      })
      authorization = `JWT ${token}`
    },

    /** The first document whose `field` equals `value`, drafts included. */
    async findOne(collection: string, field: string, value: string): Promise<Doc | null> {
      const query = new URLSearchParams({ [`where[${field}][equals]`]: value, limit: "1", depth: "0", draft: "true" })
      const { docs } = await request<{ docs: Doc[] }>(`/api/${collection}?${query}`)
      return docs[0] ?? null
    },

    async create(collection: string, data: Record<string, unknown>): Promise<Doc> {
      const { doc } = await request<{ doc: Doc }>(`/api/${collection}`, { method: "POST", body: data })
      return doc
    },

    /** Stores an image in the `media` collection; returns its document. */
    async upload(file: Blob, filename: string, alt: string): Promise<Doc> {
      const form = new FormData()
      form.append("file", file, filename)
      form.append("_payload", JSON.stringify({ alt }))
      const { doc } = await request<{ doc: Doc }>("/api/media", { method: "POST", body: form })
      return doc
    },
  }
}
