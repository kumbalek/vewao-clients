/**
 * Reading www.bbclinic.cz: a Gatsby build of a Sanity dataset. Its public
 * page-data and static-query JSON carry the structured content, so nothing is
 * scraped from rendered HTML except the order the page shows.
 */

export const SITE = "https://www.bbclinic.cz"
const SANITY_IMAGES = "https://cdn.sanity.io/images/sfqldr6j/production"

/** The content plugin's slug rule. */
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type SanityImage = { alt?: string | null; asset?: { _id: string } | null }
export type SnapshotImage = { url: string; alt: string | null; width: number; height: number }

async function get(url: string): Promise<Response> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  return response
}

/** The data of a page, e.g. `pageData("/o-nas")`. */
export async function pageData<T>(path: string): Promise<T> {
  const response = await get(`${SITE}/page-data${path}/page-data.json`)
  return ((await response.json()) as { result: { data: T } }).result.data
}

/** Data a page loads through Gatsby static queries, by their hashes. */
export async function staticQueries(path: string): Promise<Record<string, unknown>> {
  const response = await get(`${SITE}/page-data${path}/page-data.json`)
  const { staticQueryHashes } = (await response.json()) as { staticQueryHashes: string[] }
  const merged: Record<string, unknown> = {}
  for (const hash of staticQueryHashes) {
    const query = await get(`${SITE}/page-data/sq/d/${hash}.json`)
    Object.assign(merged, ((await query.json()) as { data: object }).data)
  }
  return merged
}

export async function html(path: string): Promise<string> {
  return (await get(`${SITE}${path}`)).text()
}

/** `image-<hash>-<w>x<h>-<ext>` is Sanity's asset id; the CDN URL derives from it. */
export function sanityImage(image: SanityImage | null | undefined): SnapshotImage | null {
  const id = image?.asset?._id
  if (!id) return null
  const match = id.match(/^image-([0-9a-f]+)-(\d+)x(\d+)-(\w+)$/)
  if (!match) throw new Error(`Unexpected Sanity image id ${id}`)
  const [, hash, width, height, ext] = match
  return {
    url: `${SANITY_IMAGES}/${hash}-${width}x${height}.${ext}`,
    alt: image?.alt?.trim() || null,
    width: Number(width),
    height: Number(height),
  }
}

/** "MUDr. Hana Šulcová" → "mudr-hana-sulcova". */
export function slugify(text: string): string {
  const slug = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  if (!SLUG.test(slug)) throw new Error(`Cannot make a slug from "${text}"`)
  return slug
}

/** Be gentle with the live site between requests. */
export const pause = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))
