"use client"

import { useState, useTransition } from "react"
import { addToCart, deleteLineItem } from "@lib/data/cart"
import type { GiftPackaging } from "@lib/data/gift-packaging"
import { isGiftPackaging } from "@lib/util/gift-packaging"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type GiftPackagingProps = {
  cart: HttpTypes.StoreCart
  countryCode: string
  giftPackaging: GiftPackaging
}

/**
 * Adds or removes the gift-packaging line. Its price comes from the backend;
 * promotions neither discount it nor count it (Discountable is off in admin).
 */
const GiftPackagingToggle = ({ cart, countryCode, giftPackaging }: GiftPackagingProps) => {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const giftItem = cart?.items?.find(isGiftPackaging)
  const isChecked = !!giftItem

  const handleToggle = () => {
    setError(null)
    startTransition(async () => {
      try {
        if (giftItem) {
          await deleteLineItem(giftItem.id)
        } else {
          await addToCart({
            variantId: giftPackaging.variantId,
            quantity: 1,
            countryCode,
          })
        }
      } catch {
        setError("Dárkové balení se nepodařilo změnit. Zkuste to prosím znovu.")
      }
    })
  }

  return (
    <div className="py-4 border-t border-gray-200 mt-4" data-testid="gift-packaging">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-3">
          <div className="flex items-center h-5">
            <input
              id="gift-packaging"
              name="gift-packaging"
              type="checkbox"
              checked={isChecked}
              onChange={handleToggle}
              disabled={isPending}
              aria-busy={isPending}
              aria-describedby="gift-packaging-description"
              className="w-4 h-4 text-ui-fg-interactive border-gray-300 rounded focus:ring-ui-fg-interactive disabled:opacity-50"
            />
          </div>
          <div className="text-sm leading-6">
            <label
              htmlFor="gift-packaging"
              className="font-medium text-ui-fg-base cursor-pointer select-none"
            >
              Dárkové balení
            </label>
            <p id="gift-packaging-description" className="text-ui-fg-subtle text-xs">
              Zabalíme vaši objednávku do naší originální dárkové krabice.
            </p>
          </div>
        </div>
        <div className="text-sm font-medium text-ui-fg-base min-w-12" data-testid="gift-packaging-price">
          {convertToLocale({
            amount: giftPackaging.amount,
            currency_code: giftPackaging.currencyCode,
          })}
        </div>
      </div>
      {error && (
        <p role="alert" className="pt-2 text-rose-500 text-small-regular">
          {error}
        </p>
      )}
    </div>
  )
}

export default GiftPackagingToggle
