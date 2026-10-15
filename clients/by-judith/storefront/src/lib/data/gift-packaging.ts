"use server"

import { GIFT_PACKAGING_HANDLE } from "@lib/util/gift-packaging"
import { listProducts } from "./products"

export type GiftPackaging = {
  variantId: string
  amount: number
  currencyCode: string
}

/** The gift-packaging variant and its price, or null when the shop has none. */
export async function retrieveGiftPackaging(
  countryCode: string
): Promise<GiftPackaging | null> {
  try {
    const { response } = await listProducts({
      countryCode,
      queryParams: { handle: GIFT_PACKAGING_HANDLE, limit: 1 },
    })
    const variant = response.products[0]?.variants?.[0]
    const price = variant?.calculated_price
    if (!variant || price?.calculated_amount == null || !price.currency_code) {
      return null
    }
    return {
      variantId: variant.id,
      amount: price.calculated_amount,
      currencyCode: price.currency_code,
    }
  } catch (error) {
    console.error("Gift packaging could not be loaded", error)
    return null
  }
}
