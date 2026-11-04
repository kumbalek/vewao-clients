import { readFileSync } from "node:fs"

import { expect, type APIRequestContext } from "@playwright/test"

/**
 * The CMS in the test build: specs that need it skip unless
 * E2E_PAYLOAD_DATABASE_URL points to a fresh, migrated database.
 */

export const SHOP = "http://127.0.0.1:8101"
export const hasPayload = Boolean(process.env.E2E_PAYLOAD_DATABASE_URL)
export const NEEDS_PAYLOAD = "Needs a migrated Payload database (E2E_PAYLOAD_DATABASE_URL)"

const ADMIN_EMAIL = "e2e-admin@example.invalid"
const ADMIN_PASSWORD = "e2e-admin-password-1"

export type Auth = { authorization: string }

/** Signs in the e2e admin, creating it first on a fresh database. */
export async function payloadAuth(request: APIRequestContext): Promise<Auth> {
  const init = await request.get(`${SHOP}/api/users/init`)
  const { initialized } = await init.json()
  if (!initialized) {
    await request.post(`${SHOP}/api/users/first-register`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, roles: ["admin"] },
    })
  }
  const login = await request.post(`${SHOP}/api/users/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  })
  // A database that already has other users needs its own e2e admin.
  expect(login.ok(), "Use a fresh, migrated database for E2E_PAYLOAD_DATABASE_URL").toBe(true)
  return { authorization: `JWT ${(await login.json()).token}` }
}

/** The document whose `field` equals `value`, created from `data` if missing. */
export async function ensureDoc(
  request: APIRequestContext,
  auth: Auth,
  collection: string,
  field: string,
  value: string,
  data: Record<string, unknown>
): Promise<number> {
  const query = new URLSearchParams({ [`where[${field}][equals]`]: value, draft: "true", depth: "0" })
  const found = await request.get(`${SHOP}/api/${collection}?${query}`, { headers: auth })
  const [existing] = (await found.json()).docs
  if (existing) return existing.id
  const created = await request.post(`${SHOP}/api/${collection}`, { headers: auth, data: { [field]: value, ...data } })
  expect(created.status(), await created.text()).toBe(201)
  return (await created.json()).doc.id
}

/** An image in the media collection, described by `alt`. */
export async function ensureImage(request: APIRequestContext, auth: Auth, alt: string): Promise<number> {
  const query = new URLSearchParams({ "where[alt][equals]": alt })
  const [existing] = (await (await request.get(`${SHOP}/api/media?${query}`, { headers: auth })).json()).docs
  if (existing) return existing.id
  const created = await request.post(`${SHOP}/api/media`, {
    headers: auth,
    multipart: {
      file: { name: "dn.webp", mimeType: "image/webp", buffer: readFileSync("public/dn.webp") },
      _payload: JSON.stringify({ alt }),
    },
  })
  expect(created.status(), await created.text()).toBe(201)
  return (await created.json()).doc.id
}

/** Payload's Lexical rich text, for fixtures. */
type Node = Record<string, unknown>
const element = (type: string, children: Node[], extra: Node = {}): Node => ({
  type,
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  ...extra,
  children,
})
export const BOLD = 1
export const lexical = {
  doc: (...paragraphs: Node[]) => ({ root: element("root", paragraphs) }),
  p: (...children: Node[]) => element("paragraph", children, { textFormat: 0, textStyle: "" }),
  text: (text: string, format = 0): Node => ({ type: "text", version: 1, text, format, detail: 0, mode: "normal", style: "" }),
  br: (): Node => ({ type: "linebreak", version: 1 }),
  link: (url: string, ...children: Node[]): Node => ({
    ...element("link", children),
    version: 3,
    id: crypto.randomUUID().replaceAll("-", "").slice(0, 24),
    fields: { linkType: "custom", url, newTab: /^https?:/.test(url) },
  }),
}
