"use client"

import { useTransition } from "react"
import { addToCart, deleteLineItem } from "@lib/data/cart" // Import Server Actions
import { HttpTypes } from "@medusajs/types"

type GiftPackagingProps = {
  cart: HttpTypes.StoreCart
  countryCode: string
}

const GIFT_VARIANT_ID = process.env.NEXT_PUBLIC_GIFT_PACKAGING_VARIANT_ID

const GiftPackagingToggle = ({ cart, countryCode }: GiftPackagingProps) => {
  const [isPending, startTransition] = useTransition()

  // 1. Check if Gift Packaging is already in the cart
  const giftItem = cart?.items?.find(
    (item) => item.variant_id === GIFT_VARIANT_ID
  )
  const isChecked = !!giftItem
  const isLoading = isPending

  const handleToggle = async () => {
    if (!GIFT_VARIANT_ID) return

    // Wrap server actions in transition
    startTransition(async () => {
      if (isChecked && giftItem) {
        // REMOVE: Call the server action to delete
        await deleteLineItem(giftItem.id)
      } else {
        // ADD: Call the server action to add
        await addToCart({
          variantId: GIFT_VARIANT_ID,
          quantity: 1,
          countryCode: countryCode,
        })
      }
    })
  }

  if (!GIFT_VARIANT_ID) return null

  return (
    <div className="flex items-center justify-between py-4 border-t border-gray-200 mt-4">
      <div className="flex items-center gap-x-3">
        <div className="flex items-center h-5">
          <input
            id="gift-packaging"
            name="gift-packaging"
            type="checkbox"
            checked={isChecked}
            onChange={handleToggle}
            disabled={isLoading}
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
          <p className="text-ui-fg-subtle text-xs">
            Zabalíme vaši objednávku do naší originální dárkové krabice.
          </p>
        </div>
      </div>
      <div className="text-sm font-medium text-ui-fg-base min-w-12">199 Kč</div>
    </div>
  )
}

export default GiftPackagingToggle
