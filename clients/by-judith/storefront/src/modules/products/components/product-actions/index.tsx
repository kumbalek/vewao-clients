"use client"

import { addToCart } from "@lib/data/cart"
import type { PriceReference } from "@lib/util/discount-claim"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { VariantOptions, optionsAsKeymap, useVariantOptions } from "./variant-options"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"

import { useDelayedRefresh } from "@lib/hooks/use-delayed-refresh"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  priceReferences?: PriceReference[]
}

export default function ProductActions({
  product,
  disabled,
  priceReferences,
}: ProductActionsProps) {
  const t = useTranslations("cart")
  // Shared with the option buttons, which the page places (vewao-clients#70).
  const { options, setOptionValue, setBusy } = useVariantOptions()
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string
  const { delayedRefresh, isRefreshing } = useDelayedRefresh()

  // The options wait while the item is added.
  useEffect(() => setBusy(isAdding || isRefreshing), [isAdding, isRefreshing, setBusy])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })

    await delayedRefresh()

    setIsAdding(false)
  }

  return (
    <>
      <div className="flex flex-col items-center gap-y-4" ref={actionsRef}>
        {/* On a phone the options come first; from `small` up they are under the description. */}
        <VariantOptions product={product} disabled={!!disabled} className="small:hidden" />

        <ProductPrice
          product={product}
          variant={selectedVariant}
          priceReferences={priceReferences}
        />

        <Button
          onClick={handleAddToCart}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            !isValidVariant ||
            isRefreshing
          }
          variant="primary"
          className="w-full h-10 rounded-[3rem]"
          isLoading={isAdding || isRefreshing}
          data-testid="add-product-button"
        >
          {!selectedVariant && !options
            ? t("selectVariant")
            : !inStock || !isValidVariant
            ? t("outOfStock")
            : t("addToCart")}
        </Button>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
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
