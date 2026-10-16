import { createHmac, timingSafeEqual } from "node:crypto"

export type PreviewMode = "edit" | "view"
export type PreviewGrant = { path: string; expires: number; mode: PreviewMode; signature: string }

/** The CMS signs `path|expires|mode` (see the CMS's src/lib/preview-url.ts). */
export function signPreview(secret: string, path: string, expires: number, mode: PreviewMode): string {
  return createHmac("sha256", secret).update(`${path}|${expires}|${mode}`).digest("base64url")
}

/** A grant for one storefront path, valid until it expires. */
export function verifyPreview(
  secret: string | undefined,
  grant: Partial<Record<keyof PreviewGrant, unknown>>,
  now = Date.now()
): PreviewGrant | null {
  const { path, expires, mode, signature } = grant
  if (!secret || typeof path !== "string" || typeof signature !== "string") return null
  if (mode !== "edit" && mode !== "view") return null
  const exp = Number(expires)
  if (!Number.isInteger(exp) || exp * 1000 <= now) return null
  // Only same-site paths: no protocol-relative or absolute redirects.
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return null
  const expected = Buffer.from(signPreview(secret, path, exp, mode))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  return { path, expires: exp, mode, signature }
}

export const PREVIEW_COOKIE = "cms_preview"
