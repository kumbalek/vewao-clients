import { HttpTypes } from "@medusajs/types"

import { listSaleProducts } from "@lib/data/novinky"
import { listRunningSaleLabels } from "@lib/data/sale-labels"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

/**
 * "Akce" right under the hero (owner, 2026-11-25), so the e-shop's offers are
 * seen within the first screen: the running sales that apply to a category
 * (CMS "Akce" labels while Medusa runs them, e.g. 2 + 1 zdarma on herbs) as
 * lit cards leading to it, then the products on a sale price in a rail. Shown
 * only when something is on sale.
 */
export default async function SaleShowcase({
  countryCode,
  region,
}: {
  countryCode: string
  region: HttpTypes.StoreRegion
}) {
  const [{ labels }, products] = await Promise.all([
    listRunningSaleLabels().catch(() => ({ labels: [] })),
    listSaleProducts(countryCode).catch(() => []),
  ])
  const offers = labels.filter((label) => label.categories.length > 0)
  if (!offers.length && !products.length) return null

  return (
    <section
      id="akce"
      aria-labelledby="akce-title"
      // The jump from the hero lands at the pinned header's edge (65px, 81px from `medium`), the hero fully out from under it.
      className="mx-auto w-full max-w-7xl scroll-mt-[65px] px-6 pt-10 small:pt-14 medium:scroll-mt-[81px]"
      data-testid="sale-showcase"
    >
      <h2 id="akce-title" className="mb-8 text-4xl leading-tight text-ui-fg-base small:text-6xl">
        Akce
      </h2>

      {offers.length > 0 && (
        <ul className="mb-10 grid gap-4 xsmall:grid-cols-2 small:grid-cols-3" data-testid="sale-offers">
          {offers.map((offer) => (
            <li key={offer.code}>
              <LocalizedClientLink
                href={`/categories/${offer.categories[0]}`}
                className="flex h-full flex-col items-center justify-center gap-1 rounded-popover border border-gold bg-white px-6 py-6 text-center text-ink shadow-[0_0_24px_rgb(215_180_107/0.55)] transition-shadow hover:shadow-[0_0_32px_rgb(215_180_107/0.75)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                data-testid="sale-offer"
              >
                <span className="text-3xl leading-none">{offer.label}</span>
                {offer.description && <span className="text-sm leading-snug">{offer.description}</span>}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      )}

      {products.length > 0 && (
        <ul className="mb-12 flex gap-4 overflow-x-auto px-px pb-12 small:scrollbar" data-testid="sale-products">
          {products.map((product) => (
            <li key={product.id} className="w-64 flex-shrink-0 small:w-96">
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
