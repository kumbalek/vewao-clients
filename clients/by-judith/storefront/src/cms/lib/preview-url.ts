import { previewSecret, signPreview, type PreviewMode } from '@lib/cms/preview-token'

/**
 * A signed, expiring link that opens one draft in Next.js draft mode. `edit`
 * links come from the admin and show "Upravit" links; shared links are
 * read-only. Same app, so the key comes from PAYLOAD_SECRET.
 */
export function previewUrl(input: { path: string; edit: boolean; ttlSeconds: number }): string | null {
  const secret = previewSecret()
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, '')
  if (!secret || !base) return null
  const expires = Math.floor(Date.now() / 1000) + input.ttlSeconds
  const mode: PreviewMode = input.edit ? 'edit' : 'view'
  const query = new URLSearchParams({ path: input.path, expires: String(expires), mode, signature: signPreview(secret, input.path, expires, mode) })
  return `${base}/api/cms/preview?${query}`
}
