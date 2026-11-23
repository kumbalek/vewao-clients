"use client"

import { addToCart } from "@lib/data/cart"
import type { PriceReference } from "@lib/util/discount-claim"
import { useIntersection } from "@lib/hooks/use-in-view"
import { convertToLocale } from "@lib/util/money"
import { discounted, reachedTier, regularIsLowest } from "@lib/util/product-tiers"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import ProductPrice from "../product-price"
import SalePrice from "../product-price/sale-price"
import MobileActions from "./mobile-actions"
import { VariantOptions, optionsAsKeymap, useVariantOptions } from "./variant-options"

import { useDelayedRefresh } from "@lib/hooks/use-delayed-refresh"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  priceReferences?: PriceReference[]
}

const inStock = (variant: HttpTypes.StoreProductVariant) =>
  !variant.manage_inventory || !!variant.allow_backorder || (variant.inventory_quantity ?? 0) > 0

const totalOf = (variants: HttpTypes.StoreProductVariant[]) =>
  variants.reduce((sum, v) => sum + (v.calculated_price?.calculated_amount ?? 0), 0)

/**
 * The chosen variants' prices added up, shown like a single price; with a
 * volume discount reached (vewao-platform#45), the discounted total and the
 * regular one struck through, as the cart will charge it.
 */
function TotalPrice({
  variants,
  percent,
  struck = false,
}: {
  variants: HttpTypes.StoreProductVariant[]
  percent?: number
  /** The ledger confirms the regular prices as the 30-day lowest (§ 12a). */
  struck?: boolean
}) {
  const total = totalOf(variants)
  const currency = variants[0]?.calculated_price?.currency_code ?? ""
  if (percent && struck) {
    return <SalePrice amount={discounted(total, percent)} reference={total} percentage={percent} currencyCode={currency} />
  }
  if (percent) {
    // Unconfirmed: the discounted price alone, no struck price.
    const price = discounted(total, percent)
    return (
      <div className="flex flex-col items-center text-ui-fg-base">
        <span className="text-2xl text-ui-fg-interactive">
          <span data-testid="product-price" data-value={price}>
            {convertToLocale({ amount: price, currency_code: currency })}
          </span>
        </span>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center text-ui-fg-base">
      <span className="text-2xl">
        <span data-testid="product-price" data-value={total}>
          {convertToLocale({ amount: total, currency_code: currency })}
        </span>
      </span>
    </div>
  )
}

export default function ProductActions({
  product,
  disabled,
  priceReferences,
}: ProductActionsProps) {
  const t = useTranslations("cart")
  // Shared with the option buttons, which the page places (vewao-clients#70).
  const { options, setBusy, multiple, chosen, tiers } = useVariantOptions()
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string
  const { delayedRefresh, isRefreshing } = useDelayedRefresh()

  // The options wait while the items are added.
  useEffect(() => setBusy(isAdding || isRefreshing), [isAdding, isRefreshing, setBusy])

  const hasVariants = (product.variants?.length ?? 0) > 1

  // The variant the options describe, or, where several may be chosen
  // (vewao-clients#70), the chosen ones in the product's order.
  const chosenVariants = useMemo(() => {
    const variants = product.variants ?? []
    if (multiple) return variants.filter((v) => chosen.includes(v.id))
    const match = variants.find((v) => isEqual(optionsAsKeymap(v.options), options))
    return match ? [match] : []
  }, [product.variants, multiple, chosen, options])

  const count = chosenVariants.length
  const available = count > 0 && chosenVariants.every(inStock)
  // The volume discount the choice reaches, which the cart will apply.
  const percent = count > 0 ? reachedTier(tiers, count)?.value : undefined

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // Each chosen variant is its own cart line.
  const handleAddToCart = async () => {
    if (!available) return null

    setIsAdding(true)

    for (const variant of chosenVariants) {
      await addToCart({
        variantId: variant.id,
        quantity: 1,
        countryCode,
      })
    }

    await delayedRefresh()

    setIsAdding(false)
  }

  const buttonLabel =
    count === 0
      ? hasVariants
        ? t("selectVariant")
        : t("outOfStock")
      : !available
      ? t("outOfStock")
      : count > 1
      ? t("addToCartCount", { count })
      : t("addToCart")

  // The sticky bar on a phone names the choice and its price.
  const selectionLabel = count
    ? chosenVariants.map((v) => (v.options ?? []).map((o) => o.value).join(" / ")).join(", ")
    : null
  const totalLabel =
    count > 1 || percent
      ? convertToLocale({
          amount: percent ? discounted(totalOf(chosenVariants), percent) : totalOf(chosenVariants),
          currency_code: chosenVariants[0]?.calculated_price?.currency_code ?? "",
        })
      : null

  return (
    <>
      <div className="flex flex-col items-center gap-y-4" ref={actionsRef}>
        {/* On a phone the options come first; from `small` up they are under the description. */}
        <VariantOptions product={product} disabled={!!disabled} className="small:hidden" />

        {count > 1 || percent ? (
          <TotalPrice
            variants={chosenVariants}
            percent={percent}
            struck={regularIsLowest(chosenVariants, priceReferences ?? [])}
          />
        ) : (
          <ProductPrice
            product={product}
            variant={chosenVariants[0]}
            priceReferences={priceReferences}
          />
        )}

        <Button
          onClick={handleAddToCart}
          disabled={!available || !!disabled || isAdding || isRefreshing}
          variant="primary"
          className="w-full h-10 rounded-[3rem]"
          isLoading={isAdding || isRefreshing}
          data-testid="add-product-button"
        >
          {buttonLabel}
        </Button>
        <MobileActions
          product={product}
          variant={chosenVariants[0]}
          selectionLabel={selectionLabel}
          priceOverride={totalLabel}
          canAdd={available}
          buttonLabel={buttonLabel}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding || isRefreshing}
          show={!inView}
          optionsDisabled={!!disabled || isAdding || isRefreshing}
          priceReferences={priceReferences}
        />
      </div>
    </>
  )
}
