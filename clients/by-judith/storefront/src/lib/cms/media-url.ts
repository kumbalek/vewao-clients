/**
 * Payload prefixes its files with the shop's own origin (serverURL). The shop
 * serves them itself, so next/image gets the path: a local image, not a remote
 * host it would have to allow and fetch over the network.
 */
export function sameOriginPath(url: string, origin = process.env.NEXT_PUBLIC_BASE_URL): string {
  const base = origin?.replace(/\/+$/, "")
  return base && url.startsWith(`${base}/`) ? url.slice(base.length) : url
}
