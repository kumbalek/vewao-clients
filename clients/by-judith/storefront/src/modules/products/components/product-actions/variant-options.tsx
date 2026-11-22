"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React, { createContext, useContext, useState } from "react"

import OptionSelect from "./option-select"

/**
 * The product page's chosen variant options, shared by the option buttons and
 * the price and cart button under the image (vewao-clients#70): on a large
 * screen the options sit under the description, on a phone above the price.
 */

type Options = Record<string, string | undefined>
type VariantOptionsState = {
  options: Options
  setOptionValue: (optionId: string, value: string) => void
  /** Adding to the cart: the options wait. */
  busy: boolean
  setBusy: (busy: boolean) => void
}

const VariantOptionsContext = createContext<VariantOptionsState | null>(null)

export const optionsAsKeymap = (variantOptions: HttpTypes.StoreProductVariant["options"]): Options =>
  (variantOptions ?? []).reduce((acc: Options, option) => {
    if (option.option_id) acc[option.option_id] = option.value
    return acc
  }, {})

export function VariantOptionsProvider({
  product,
  children,
}: {
  product: HttpTypes.StoreProduct
  children: React.ReactNode
}) {
  // A single variant is chosen during render, not in an effect: otherwise the
  // server HTML shows every single-variant product as sold out.
  const [options, setOptions] = useState<Options>(() =>
    product.variants?.length === 1 ? optionsAsKeymap(product.variants[0].options) : {}
  )
  const [busy, setBusy] = useState(false)
  const setOptionValue = (optionId: string, value: string) =>
    setOptions((prev) => ({ ...prev, [optionId]: value }))

  return (
    <VariantOptionsContext.Provider value={{ options, setOptionValue, busy, setBusy }}>
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
  const { options, setOptionValue, busy } = useVariantOptions()
  if ((product.variants?.length ?? 0) < 2) return null

  return (
    <div className={clx("flex w-full flex-col gap-y-4", className)}>
      {(product.options ?? []).map((option) => (
        <OptionSelect
          key={option.id}
          option={option}
          current={options[option.id]}
          updateOption={setOptionValue}
          title={option.title ?? ""}
          data-testid="product-options"
          disabled={disabled || busy}
        />
      ))}
    </div>
  )
}
