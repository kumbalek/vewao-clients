import type { LexicalNode, LexicalState } from "./lexical"

/**
 * Product texts live in Payload (vewao-clients#50); Medusa keeps the price,
 * stock and the other shop properties. This module converts the legacy Medusa
 * text fields into Payload's: once, when the sync creates a product's document,
 * and on the product page while a product has no document yet.
 *
 * No imports with runtime effect: `node --experimental-strip-types` loads it in
 * the unit tests, and the Payload config loads it on the server.
 */

/** The text fields a Medusa product carried before Payload. */
export type MedusaProductText = {
  subtitle?: string | null
  description?: string | null
  metadata?: Record<string, unknown> | null
}

export type ProductTexts = {
  subtitle: string | null
  description: LexicalState
  dosage: LexicalState
  ingredients: LexicalState
  information: LexicalState
}

/** A run of ingredient text; `allergen` runs must be emphasised (Regulation (EU) 1169/2011, Art. 21(1)(b)). */
export type IngredientSegment = { text: string; allergen: boolean }

/**
 * The product's `metadata.ingredients`: a JSON array of strings, as the legacy
 * shop stored it, or plain text with one ingredient per line. Allergens listed
 * in Annex II are marked in the admin as `**hořčice**`.
 */
export function parseIngredients(raw: unknown): IngredientSegment[][] {
  if (typeof raw !== "string" || !raw.trim()) return []
  let lines: string[]
  try {
    const parsed: unknown = JSON.parse(raw)
    lines = Array.isArray(parsed) ? parsed.map(String) : [String(parsed)]
  } catch {
    // Hand-edited metadata must not take the product page down.
    lines = raw.split("\n")
  }
  return lines.map((line) => line.trim()).filter(Boolean).map(splitAllergens)
}

function splitAllergens(line: string): IngredientSegment[] {
  const segments: IngredientSegment[] = []
  const pattern = /\*\*(.+?)\*\*/g
  let last = 0
  for (let match = pattern.exec(line); match; match = pattern.exec(line)) {
    if (match.index > last) segments.push({ text: line.slice(last, match.index), allergen: false })
    segments.push({ text: match[1]!, allergen: true })
    last = match.index + match[0].length
  }
  if (last < line.length) segments.push({ text: line.slice(last), allergen: false })
  return segments
}

// Payload's Lexical JSON, as its default editor saves it.
const BOLD = 1
const element = (type: string, children: LexicalNode[], extra: Record<string, unknown> = {}): LexicalNode => ({
  type,
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  ...extra,
  children,
})
const text = (value: string, format = 0): LexicalNode => ({
  type: "text",
  version: 1,
  text: value,
  format,
  detail: 0,
  mode: "normal",
  style: "",
})
const paragraph = (children: LexicalNode[]) => element("paragraph", children, { textFormat: 0, textStyle: "" })
const lexicalDoc = (children: LexicalNode[]): LexicalState => (children.length ? { root: element("root", children) } : null)

const asText = (value: unknown) => (typeof value === "string" ? value : "")

/** One block of text; its single line breaks stay line breaks. */
function withLineBreaks(value: string): LexicalNode[] {
  return value.split("\n").flatMap((line, index) => {
    const run = line.trimEnd()
    const breakBefore: LexicalNode[] = index > 0 ? [{ type: "linebreak", version: 1 }] : []
    return run ? [...breakBefore, text(run)] : breakBefore
  })
}

/** Paragraphs from text whose parts are separated by `separator`. */
function paragraphs(value: string, separator: RegExp): LexicalNode[] {
  return value
    .split(separator)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => paragraph(withLineBreaks(part)))
}

/**
 * The Payload fields for a product's legacy Medusa texts: the description's
 * blank lines and the `;` in `dose` and `informations` separate paragraphs, the
 * ingredients become a bulleted list with allergens in bold, and the `weight`
 * text closes the information.
 */
export function productTextsFromMedusa(product: MedusaProductText): ProductTexts {
  const metadata = product.metadata ?? {}
  const weight = asText(metadata.weight).trim()
  const ingredients = parseIngredients(metadata.ingredients)
  return {
    subtitle: asText(product.subtitle).trim() || null,
    description: lexicalDoc(paragraphs(asText(product.description), /\n\s*\n/)),
    dosage: lexicalDoc(paragraphs(asText(metadata.dose), /;/)),
    ingredients: lexicalDoc(
      ingredients.length
        ? [
            element(
              "list",
              ingredients.map((segments, index) =>
                element(
                  "listitem",
                  segments.map((segment) => text(segment.text, segment.allergen ? BOLD : 0)),
                  { value: index + 1 }
                )
              ),
              { listType: "bullet", start: 1, tag: "ul" }
            ),
          ]
        : []
    ),
    information: lexicalDoc([
      ...paragraphs(asText(metadata.informations), /;/),
      ...(weight ? [paragraph(withLineBreaks(weight))] : []),
    ]),
  }
}

/** What Medusa's product sync sends: identity, plus the texts used only for the first fill. */
export type SyncProduct = MedusaProductText & { id: string; handle: string; title: string }

const MAX_PRODUCTS = 1000
const MAX_FIELD = 500
const isShortText = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "" && value.length <= MAX_FIELD
const isOptionalText = (value: unknown) => value == null || typeof value === "string"
const isOptionalRecord = (value: unknown) =>
  value == null || (typeof value === "object" && !Array.isArray(value))

/** The products in a sync request body, or the reason it is rejected. */
export function parseSyncProducts(body: unknown): SyncProduct[] | string {
  const products = (body as { products?: unknown } | null)?.products
  if (!Array.isArray(products)) return "products must be an array"
  if (products.length > MAX_PRODUCTS) return `at most ${MAX_PRODUCTS} products per request`
  for (let index = 0; index < products.length; index++) {
    const p = products[index] as Record<string, unknown> | null
    if (!p || !isShortText(p.id) || !isShortText(p.handle) || !isShortText(p.title)) {
      return `products[${index}] needs id, handle and title`
    }
    if (!isOptionalText(p.subtitle) || !isOptionalText(p.description) || !isOptionalRecord(p.metadata)) {
      return `products[${index}] has invalid texts`
    }
  }
  return products as SyncProduct[]
}

/** The Medusa product IDs in a delete request body, or the reason it is rejected. */
export function parseDeleteIds(body: unknown): string[] | string {
  const ids = (body as { ids?: unknown } | null)?.ids
  if (!Array.isArray(ids) || !ids.every(isShortText)) return "ids must be an array of product IDs"
  if (ids.length > MAX_PRODUCTS) return `at most ${MAX_PRODUCTS} IDs per request`
  return ids
}

export type ExistingProductDoc = { handle: string; title: string; _status?: "draft" | "published" | null }
export type SyncAction = "create" | "rename" | "pending" | "unchanged"

/**
 * What the sync does for one product (D22). It never touches content. A rename
 * waits while an editor's draft is pending: saving over the draft would
 * unpublish the product's texts, and publishing it would publish the editor's
 * unreviewed work. The next sync retries.
 */
export function syncAction(existing: ExistingProductDoc | null | undefined, product: SyncProduct): SyncAction {
  if (!existing) return "create"
  if (existing.handle === product.handle && existing.title === product.title) return "unchanged"
  return existing._status === "published" ? "rename" : "pending"
}
