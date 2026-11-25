import { Text } from "@medusajs/ui"
import { listPriceReferences } from "@lib/data/price-history"
import { claimForPrice } from "@lib/util/discount-claim"
import { getProductPrice } from "@lib/util/get-product-price"
import { productCategoryPath } from "@lib/util/category-path"
import { cardVariant, inStock } from "@lib/util/product"
import { productVoucherTitle } from "@lib/util/voucher"
import { hasPriceRange } from "@lib/util/price-range"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductCardCart from "../add-to-cart/product-card-cart"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })
  const claim =
    cheapestPrice?.price_type === "sale"
      ? claimForPrice(
          cheapestPrice,
          await listPriceReferences(product.id, region.id)
        )
      : null
  const variant = cardVariant(product)
  // The most specific category, e.g. Gold Edition for a herb.
  const category = productCategoryPath(product.categories).at(-1)

  return (
    // One link, the title, stretched over the whole card: the photo and price
    // are clickable too, keyboard users meet one stop per card, and the
    // add-to-cart (a button) is not inside a link.
    // Full height of its row, so the cards in a row end level (owner, 2026-11-25).
    <div className="group relative h-full" data-testid="product-card">
      {/* The photo at 90 % of the card's width; the texts in the same column (owner, 2026-11-24/25). */}
      <div className="mx-auto flex h-full w-[90%] flex-col" data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          ratio="product"
          isFeatured={isFeatured}
          voucherTitle={productVoucherTitle(product)}
        />
        {/* Under the photo (owner, 2026-11-25): the category, the title, then the
            price on the left and the add-to-cart on the right. The category link
            and the add-to-cart sit above the stretched title link. */}
        <div className="mt-3 flex flex-1 flex-col items-stretch px-4">
          {category && (
            <LocalizedClientLink
              href={`/categories/${category.handle}`}
              // The padding, offset by a negative margin, gives the link a 24px tall target (WCAG 2.5.8).
              className="relative z-10 -my-1 self-start py-1 text-xs leading-4 text-ui-fg-muted hover:text-ui-fg-base hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              data-testid="product-category"
            >
              {category.name}
            </LocalizedClientLink>
          )}
          <Text className="text-left text-lg font-medium leading-7 text-ui-fg-base" data-testid="product-title">
            <LocalizedClientLink
              href={`/products/${product.handle}`}
              className="after:absolute after:inset-0 after:z-[1] after:rounded-[3rem] after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ink"
            >
              {product.title}
            </LocalizedClientLink>
          </Text>
          {/* At the card's bottom, at least 20px under the title; a shorter title leaves more room. */}
          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            {cheapestPrice ? <PreviewPrice price={cheapestPrice} claim={claim} from={hasPriceRange(product)} /> : <span />}
            <div className="relative z-10 shrink-0">
              <ProductCardCart
                productId={product.id}
                handle={product.handle ?? ""}
                title={product.title ?? ""}
                variantId={variant?.id ?? null}
                available={variant ? inStock(variant) : false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
