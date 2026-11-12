import "server-only"

import { getCmsProduct, previewGrantFor, type CmsProduct } from "@lib/cms/client"
import type { LexicalState } from "@lib/cms/lexical"
import { productTextsFromMedusa, type MedusaProductText, type ProductTexts } from "@lib/cms/product-texts"
import type { PreviewGrant } from "@lib/cms/preview-token"

export type ProductPageTexts = {
  texts: ProductTexts
  /** The Payload document, when the texts come from one. */
  docId: number | null
  /** A signed CMS preview of this product page. */
  grant: PreviewGrant | null
}

const fromDoc = (doc: CmsProduct): ProductTexts => ({
  subtitle: doc.subtitle?.trim() || null,
  description: doc.description as LexicalState,
  dosage: doc.dosage as LexicalState,
  ingredients: doc.ingredients as LexicalState,
  information: doc.information as LexicalState,
})

const EMPTY: ProductTexts = { subtitle: null, description: null, dosage: null, ingredients: null, information: null }

/**
 * The texts on a product page come from Payload (vewao-clients#50). Until the
 * sync has created the product's document, or if the CMS cannot be read, the
 * legacy Medusa fields stand in, so the page keeps its description and the
 * legally required ingredients.
 */
export async function getProductPageTexts(
  product: MedusaProductText & { id: string; handle: string },
  path: string
): Promise<ProductPageTexts> {
  const grant = await previewGrantFor(path)
  try {
    const doc = await getCmsProduct(product.id, product.handle, Boolean(grant))
    if (doc === "missing") return { texts: productTextsFromMedusa(product), docId: null, grant }
    // Unpublished by an editor: the shop shows no texts rather than stale Medusa ones.
    return { texts: doc ? fromDoc(doc) : EMPTY, docId: doc?.id ?? null, grant }
  } catch (error) {
    console.error(`Product texts for ${product.handle} not read from the CMS: ${(error as Error).message}`)
    return { texts: productTextsFromMedusa(product), docId: null, grant: null }
  }
}
