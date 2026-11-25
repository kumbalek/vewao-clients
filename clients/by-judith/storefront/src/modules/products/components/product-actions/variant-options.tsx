"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React, { createContext, useContext, useState } from "react"

import type { ProductTier } from "@lib/util/product-tiers"
import { allowsSeveralVariants } from "@lib/util/voucher"
import DiscountBoxes from "./discount-boxes"
import OptionSelect from "./option-select"

/**
 * The product page's chosen variant options, shared by the option buttons and
 * the price and cart button under the image (vewao-clients#70): on a large
 * screen the options sit under the description, on a phone above the price.
 *
 * Where several variants may be bought at once (a voucher whose variants
 * differ in one option, such as Ultherapy's areas), the buttons toggle and the
 * chosen variants are kept in the product's order.
 */

type Options = Record<string, string | undefined>
type VariantOptionsState = {
  options: Options
  setOptionValue: (optionId: string, value: string) => void
  multiple: boolean
  /** The chosen variants' ids, where several may be chosen. */
  chosen: string[]
  toggleVariant: (variantId: string) => void
  /** Adding to the cart: the options wait. */
  busy: boolean
  setBusy: (busy: boolean) => void
  /** Volume discounts on this product, shown under the options (vewao-platform#45). */
  tiers: ProductTier[]
}

const VariantOptionsContext = createContext<VariantOptionsState | null>(null)

export const optionsAsKeymap = (variantOptions: HttpTypes.StoreProductVariant["options"]): Options =>
  (variantOptions ?? []).reduce((acc: Options, option) => {
    if (option.option_id) acc[option.option_id] = option.value
    return acc
  }, {})

export function VariantOptionsProvider({
  product,
  tiers = [],
  children,
}: {
  product: HttpTypes.StoreProduct
  tiers?: ProductTier[]
  children: React.ReactNode
}) {
  // A single variant is chosen during render, not in an effect: otherwise the
  // server HTML shows every single-variant product as sold out.
  const [options, setOptions] = useState<Options>(() =>
    product.variants?.length === 1 ? optionsAsKeymap(product.variants[0].options) : {}
  )
  const [chosen, setChosen] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const order = (product.variants ?? []).map((v) => v.id)

  const setOptionValue = (optionId: string, value: string) =>
    setOptions((prev) => ({ ...prev, [optionId]: value }))
  const toggleVariant = (variantId: string) =>
    setChosen((prev) => {
      const next = prev.includes(variantId) ? prev.filter((id) => id !== variantId) : [...prev, variantId]
      return order.filter((id) => next.includes(id))
    })

  return (
    <VariantOptionsContext.Provider
      value={{ options, setOptionValue, multiple: allowsSeveralVariants(product), chosen, toggleVariant, busy, setBusy, tiers }}
    >
      {children}
    </VariantOptionsContext.Provider>
  )
}

export function useVariantOptions(): VariantOptionsState {
  const state = useContext(VariantOptionsContext)
  if (!state) throw new Error("useVariantOptions needs a VariantOptionsProvider")
  return state
}

/** The option buttons of a product with more than one variant; nothing otherwise. */
export function VariantOptions({
  product,
  disabled = false,
  className,
}: {
  product: HttpTypes.StoreProduct
  disabled?: boolean
  className?: string
}) {
  const { options, setOptionValue, multiple, chosen, toggleVariant, busy } = useVariantOptions()
  const variants = product.variants ?? []
  if (variants.length < 2) return null

  // Several at once: the product has one option, so each value is one variant.
  const variantWith = (value: string) => variants.find((v) => v.options?.some((o) => o.value === value))
  const chosenValues = variants
    .filter((v) => chosen.includes(v.id))
    .map((v) => v.options?.[0]?.value)
    .filter((value): value is string => !!value)

  return (
    <div className={clx("flex w-full flex-col gap-y-4", className)}>
      {(product.options ?? []).map((option) => (
        <OptionSelect
          key={option.id}
          option={option}
          current={multiple ? chosenValues : options[option.id]}
          multiple={multiple}
          updateOption={
            multiple
              ? (_, value) => {
                  const variant = variantWith(value)
                  if (variant) toggleVariant(variant.id)
                }
              : setOptionValue
          }
          title={option.title ?? ""}
          data-testid="product-options"
          disabled={disabled || busy}
        />
      ))}
    </div>
  )
}

/**
 * The volume discounts (vewao-clients#70) as boxes lit by the choice. The page
 * places them under the add-to-cart, with the other sale boxes (owner, 2026-11-25).
 */
export function VariantDiscountBoxes() {
  const { options, multiple, chosen, tiers } = useVariantOptions()
  // How many the choice holds: the chosen variants, or one once an option is picked.
  return <DiscountBoxes tiers={tiers} count={multiple ? chosen.length : Object.values(options).some(Boolean) ? 1 : 0} />
}
