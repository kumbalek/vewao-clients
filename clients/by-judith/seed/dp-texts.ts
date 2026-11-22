import { readFileSync, writeFileSync } from "node:fs"

import { dpHandle } from "./dp-decisions.ts"
import type { DpCatalogue } from "./extract-dp.ts"
import { htmlToLexical, type LexicalState } from "./payload/html-lexical.ts"

/**
 * The DP Dermaceuticals texts for Payload (vewao-clients#64), from
 * dp-catalogue.json into dp-texts.json: per product (by its handle in the new
 * shop) the old shop's summary as `subtitle` and its "Popis" tab as
 * `description`. Links back to the old shop keep their text only. The
 * storefront's `cms:import-product-texts` writes them into empty fields.
 */

export type ProductTexts = { subtitle: string | null; description: LexicalState | null }
export type ProductTextsFile = { source: string; products: Record<string, ProductTexts> }

const catalogue = JSON.parse(readFileSync(new URL("./dp-catalogue.json", import.meta.url), "utf8")) as DpCatalogue
const products: Record<string, ProductTexts> = {}
let withDescription = 0
for (const product of catalogue.products) {
  const description = product.description_html
    ? htmlToLexical(product.description_html, { dropLinksTo: ["shop.bbclinic.cz"] })
    : null
  if (description) withDescription++
  products[dpHandle(product.handle)] = { subtitle: product.summary, description }
}
const file: ProductTextsFile = { source: `${catalogue.source} (${catalogue.extracted_at})`, products }
writeFileSync(new URL("./dp-texts.json", import.meta.url), `${JSON.stringify(file, null, 2)}\n`)
console.log(`dp-texts.json: ${Object.keys(products).length} products, ${withDescription} with a description`)
