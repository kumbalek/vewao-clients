import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { pause, slugify } from "./content/sanity.ts"

/**
 * Snapshot the DP Dermaceuticals range from the clinic's Upgates shop
 * (shop.bbclinic.cz) into dp-catalogue.json for setup-catalogue.ts
 * (vewao-clients#64): the subcategories in the shop's order with their
 * products, and per product the code, title, price with VAT, variants and main
 * image. Prices come from the `var upgates = {…}` data on each product page.
 * Descriptions are not copied: the owner writes them in Payload.
 */

const SHOP = "https://shop.bbclinic.cz"
const DP = "/dp-dermaceuticals"
const AGENT = "Mozilla/5.0 (vewao catalogue import)"

export type DpVariant = { title: string; sku: string; price_czk: number }
export type DpProduct = {
  handle: string
  title: string
  source_url: string
  sku: string
  price_czk: number
  vat_rate: number
  image: string | null
  /** The variant option's name (Množství, Odstín), or null for a single variant. */
  option: string | null
  variants: DpVariant[]
  /** The one-line summary under the title. */
  summary: string | null
  /** The "Popis" tab's HTML as the shop serves it; dp-texts.ts converts it for Payload. */
  description_html: string | null
}
export type DpCategory = { title: string; handle: string; source_url: string; products: string[] }
export type DpCatalogue = {
  source: string
  extracted_at: string
  categories: DpCategory[]
  products: DpProduct[]
}

type UpgatesPrice = { withVat: number; vatRate: number }
type UpgatesProduct = {
  code: string
  title: string
  price: UpgatesPrice
  options?: { code: string; price: UpgatesPrice }[] | null
}

async function page(path: string): Promise<string> {
  const response = await fetch(`${SHOP}${path}`, { headers: { "user-agent": AGENT } })
  if (!response.ok) throw new Error(`GET ${path}: ${response.status}`)
  return response.text()
}

const ENTITIES: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " }

/** The visible text of an HTML fragment. */
export function text(fragment: string): string {
  return fragment
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) =>
      code[0] === "#"
        ? String.fromCodePoint(code[1]?.toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1)))
        : (ENTITIES[code.toLowerCase()] ?? entity)
    )
    .replace(/\s+/g, " ")
    .trim()
}

/** The JSON object assigned to `var upgates`, read by matching its braces. */
export function upgatesData(html: string): { product: UpgatesProduct | null } {
  const start = html.indexOf("{", html.indexOf("var upgates ="))
  if (start < 0) throw new Error("No upgates data on the page")
  let depth = 0
  let inString = false
  for (let i = start; i < html.length; i++) {
    const char = html[i]
    if (inString) {
      if (char === "\\") i++
      else if (char === '"') inString = false
    } else if (char === '"') inString = true
    else if (char === "{") depth++
    else if (char === "}" && --depth === 0) return JSON.parse(html.slice(start, i + 1))
  }
  throw new Error("Unterminated upgates data")
}

/** The subcategory tiles in the category page's main content, in the shop's order. */
export function subcategoryLinks(html: string): { slug: string; title: string }[] {
  const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"))
  const links: { slug: string; title: string }[] = []
  for (const match of main.matchAll(/<a href="https:\/\/shop\.bbclinic\.cz\/([a-z0-9-]+)" class="d-block[^"]*">(.*?)<\/a>/gs)) {
    if (!links.some((link) => link.slug === match[1])) links.push({ slug: match[1]!, title: text(match[2]!) })
  }
  return links
}

/** Product links of a category listing, in the shop's order. */
export function productLinks(html: string): string[] {
  const paths: string[] = []
  for (const match of html.matchAll(/p-i-header[^>]*>\s*<a href="(\/p\/[^"]+)"/g)) {
    if (!paths.includes(match[1]!)) paths.push(match[1]!)
  }
  return paths
}

/** The variant select's label and choices, in the page's order. */
export function variantChoices(html: string): { option: string; values: string[] } | null {
  const select = html.match(/<select[^>]*name="options\[\d+\]"[^>]*>(.*?)<\/select>/s)
  if (!select) return null
  const label = html.match(/<label[^>]*for="[^"]*options[^"]*"[^>]*>(.*?)<\/label>/s)
  const values = [...select[1]!.matchAll(/<option value="([^"]*)"[^>]*>(.*?)<\/option>/gs)]
    .filter((option) => option[1] !== "--")
    .map((option) => text(option[2]!))
  return { option: label ? text(label[1]!) : "Varianta", values }
}

/** The inner HTML of the element that `start` opens, by counting nested `<div>`s. */
function innerDiv(html: string, start: number): string {
  const open = html.indexOf(">", start) + 1
  let depth = 1
  let at = open
  while (depth > 0) {
    const nextOpen = html.indexOf("<div", at)
    const nextClose = html.indexOf("</div>", at)
    if (nextClose < 0) throw new Error("Unclosed <div>")
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth++
      at = nextOpen + 4
    } else {
      depth--
      at = nextClose + 6
    }
  }
  return html.slice(open, at - 6)
}

/** The "Popis" tab's HTML, or null when the page has none. */
export function descriptionHtml(html: string): string | null {
  const start = html.indexOf('<div id="description" class="')
  if (start < 0) return null
  const inner = innerDiv(html, start).trim()
  return inner || null
}

/** The summary paragraph without its "Více" link. */
export function summary(html: string): string | null {
  const match = html.match(/<p itemprop="description">(.*?)(?:<a [^>]*data-scroll-id[^>]*>.*?<\/a>)?\s*<\/p>/s)
  return match ? text(match[1]!) || null : null
}

export function productFromPage(html: string, path: string): DpProduct {
  const data = upgatesData(html).product
  if (!data) throw new Error(`${path}: no product data`)
  const title = text(data.title)
  const choices = variantChoices(html)
  const options = data.options ?? []
  if (choices && choices.values.length !== options.length) {
    throw new Error(`${path}: ${choices.values.length} choices but ${options.length} priced options`)
  }
  const variants: DpVariant[] =
    choices && options.length
      ? options.map((option, i) => ({ title: choices.values[i]!, sku: option.code, price_czk: option.price.withVat }))
      : [{ title, sku: data.code, price_czk: data.price.withVat }]
  const image = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? null
  return {
    handle: slugify(title),
    title,
    source_url: `${SHOP}${path}`,
    sku: data.code,
    price_czk: data.price.withVat,
    vat_rate: data.price.vatRate,
    image,
    option: choices && options.length ? choices.option : null,
    variants,
    summary: summary(html),
    description_html: descriptionHtml(html),
  }
}

async function main() {
  const categories: DpCategory[] = []
  const products = new Map<string, DpProduct>()
  for (const link of subcategoryLinks(await page(DP))) {
    const handles: string[] = []
    for (const path of productLinks(await page(`/${link.slug}`))) {
      let product = [...products.values()].find((p) => p.source_url === `${SHOP}${path}`)
      if (!product) {
        await pause(400)
        product = productFromPage(await page(path), path)
        if (products.has(product.handle)) throw new Error(`Duplicate handle ${product.handle}`)
        products.set(product.handle, product)
      }
      handles.push(product.handle)
    }
    categories.push({ title: link.title, handle: slugify(link.title), source_url: `${SHOP}/${link.slug}`, products: handles })
    console.log(`${link.title}: ${handles.length} products`)
    await pause(400)
  }
  const catalogue: DpCatalogue = {
    source: `${SHOP}${DP}`,
    extracted_at: new Date().toISOString().slice(0, 10),
    categories,
    products: [...products.values()],
  }
  writeFileSync(new URL("./dp-catalogue.json", import.meta.url), `${JSON.stringify(catalogue, null, 2)}\n`)
  console.log(`dp-catalogue.json: ${categories.length} categories, ${products.size} products`)
}

// Run as a script, not when the tests import the parsers (Node < 22.18 lacks import.meta.main).
if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
