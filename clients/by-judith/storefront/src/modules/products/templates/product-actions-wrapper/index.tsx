import { listPriceReferences, listSalePriceReferences } from "@lib/data/price-history"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
  withReferences = false,
}: {
  id: string
  region: HttpTypes.StoreRegion
  /** A volume discount may strike prices through: fetch the ledger regardless of a sale. */
  withReferences?: boolean
}) {
  const product = await listProducts({
    queryParams: { id: [id] },
    regionId: region.id,
  }).then(({ response }) => response.products[0])

  if (!product) {
    return null
  }

  const priceReferences = withReferences
    ? await listPriceReferences(product.id, region.id)
    : await listSalePriceReferences(product, region.id)

  return (
    <ProductActions
      product={product}
      region={region}
      priceReferences={priceReferences}
    />
  )
}
