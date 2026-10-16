import { createHmac } from 'node:crypto'

/**
 * A signed, expiring link that opens one draft on the storefront in Next.js
 * draft mode. `edit` links come from the admin and show "Upravit" links;
 * shared links are read-only. The storefront verifies the same signature.
 */
export function previewUrl(input: { path: string; edit: boolean; ttlSeconds: number }): string | null {
  const storefront = process.env.STOREFRONT_URL
  const secret = process.env.PREVIEW_SECRET
  if (!storefront || !secret) return null
  const expires = Math.floor(Date.now() / 1000) + input.ttlSeconds
  const mode = input.edit ? 'edit' : 'view'
  const signature = createHmac('sha256', secret).update(`${input.path}|${expires}|${mode}`).digest('base64url')
  const query = new URLSearchParams({ path: input.path, expires: String(expires), mode, signature })
  return `${storefront.replace(/\/+$/, '')}/api/cms/preview?${query}`
}
