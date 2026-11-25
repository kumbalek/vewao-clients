"use client"

import { clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"

import { useProductCart } from "@lib/context/cart-lines"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AddToCartControl, { BUY_BUTTON } from "."
import HoverNote from "./hover-note"

type ProductCardCartProps = {
  productId: string
  handle: string
  title: string
  /** The variant the card adds; null when a choice is needed on the product page. */
  variantId: string | null
  /** False also when the listing says nothing about stock. */
  available: boolean
}

/** The small add-to-cart over a product card's photo (vewao-clients#75). */
export default function ProductCardCart({ productId, handle, title, variantId, available }: ProductCardCartProps) {
  const t = useTranslations("cart")
  const { quantity, add, removeOne, isPending, failed } = useProductCart(productId)

  if (!variantId) return <ChooseVariantLink handle={handle} title={title} />

  return (
    <AddToCartControl
      size="small"
      quantity={quantity}
      onAdd={() => void add([variantId])}
      onRemoveOne={() => void removeOne()}
      label={t("addToCartProduct", { title })}
      removeLabel={t("removeOneProduct", { title })}
      countLabel={t("inCartCount", { count: quantity })}
      busy={isPending}
      unavailableNote={available ? null : t("notInStock")}
      error={failed ? t("updateFailed") : null}
      className="flex-col-reverse items-end"
      // Not the product page's "add-product-button": related products are cards on that page.
      buttonTestId="card-add-button"
      data-testid="card-add-to-cart"
    />
  )
}

/** A product with a choice (shades, areas): an "i" in the buy button's look, leading to the product page. */
function ChooseVariantLink({ handle, title }: { handle: string; title: string }) {
  const t = useTranslations("cart")

  return (
    <HoverNote note={t("moreVariants")} className="h-11 w-11" data-testid="card-choose-variant">
      {(noteId) => (
        <LocalizedClientLink
          href={`/products/${handle}`}
          aria-label={t("chooseVariantProduct", { title })}
          aria-describedby={noteId}
          data-testid="choose-variant-link"
          className={clx(BUY_BUTTON, "flex h-11 w-11 items-center justify-center")}
        >
          <span aria-hidden="true" className="text-lg italic leading-none">
            i
          </span>
        </LocalizedClientLink>
      )}
    </HoverNote>
  )
}
