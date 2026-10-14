"use client"

import { Button, Heading } from "@medusajs/ui"
import { useTranslations } from "next-intl"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
// import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import GiftPackagingToggle from "@modules/cart/components/gift-packaging"
import { HttpTypes } from "@medusajs/types"
import type { GiftPackaging } from "@lib/data/gift-packaging"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
  giftPackaging: GiftPackaging | null
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart, giftPackaging }: SummaryProps) => {
  const t = useTranslations("cart")
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        {t("summary")}
      </Heading>
      {/* <DiscountCode cart={cart} /> */}
      <Divider />
      <CartTotals totals={cart} />
      {giftPackaging && (
        <GiftPackagingToggle
          cart={cart}
          countryCode={"cz"}
          giftPackaging={giftPackaging}
        />
      )}
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
      >
        <Button className="w-full h-10">{t("goToCheckout")}</Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
