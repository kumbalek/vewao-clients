"use client"

import { freeShippingTarget } from "@lib/util/free-shipping"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, XMark } from "@medusajs/icons"
import {
  HttpTypes,
  StoreCart,
  StoreCartShippingOption,
  StorePrice,
} from "@medusajs/types"
import { Button, clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useState } from "react"
import { StoreFreeShippingPrice } from "types/global"
import { useTranslations } from "next-intl"

const computeTarget = (
  cart: HttpTypes.StoreCart,
  price: HttpTypes.StorePrice
) => {
  const priceRule = (price.price_rules || []).find(
    (pr) => pr.attribute === "item_total"
  )!

  return freeShippingTarget(cart.item_total, priceRule)
}

export default function ShippingPriceNudge({
  variant = "inline",
  cart,
  shippingOptions,
}: {
  variant?: "popup" | "inline"
  cart: StoreCart
  shippingOptions: StoreCartShippingOption[]
}) {
  const t = useTranslations("shipping")

  if (!cart || !shippingOptions?.length) {
    return
  }

  // Check if any shipping options have a conditional price based on item_total
  const freeShippingPrice = shippingOptions
    .map((shippingOption) => {
      const calculatedPrice = shippingOption.calculated_price

      if (!calculatedPrice) {
        return
      }

      // Get all prices that are:
      // 1. Currency code is same as the cart's
      // 2. Have a rule that is set on item_total
      const validCurrencyPrices = shippingOption.prices.filter(
        (price) =>
          price.currency_code === cart.currency_code &&
          (price.price_rules || []).some(
            (priceRule) => priceRule.attribute === "item_total"
          )
      )

      return validCurrencyPrices.map((price) => {
        return {
          ...price,
          shipping_option_id: shippingOption.id,
          ...computeTarget(cart, price),
        }
      })
    })
    .flat(1)
    .filter(Boolean)
    // We focus here entirely on free shipping, but this can be edited to handle multiple layers
    // of reduced shipping prices.
    .find((price) => price?.amount === 0)

  if (!freeShippingPrice) {
    return
  }

  if (variant === "popup") {
    return <FreeShippingPopup cart={cart} price={freeShippingPrice} t={t} />
  } else {
    return <FreeShippingInline cart={cart} price={freeShippingPrice} t={t} />
  }
}

function FreeShippingInline({
  cart,
  price,
  t,
}: {
  cart: StoreCart
  price: StorePrice & {
    target_reached: boolean
    target_remaining: number
    remaining_percentage: number
  }
  t: Function
}) {
  return (
    <div className="bg-neutral-100 p-2  rounded-[3rem] border">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-neutral-600">
          <div>
            {price.target_reached ? (
              <div className="flex items-center gap-1.5">
                <CheckCircleSolid className="text-green-500 inline-block" />{" "}
                {t("unlockedFree")}
              </div>
            ) : (
              <div
                className={clx("visible", {
                  "opacity-0 invisible": price.target_reached,
                })}
              >
                {t("missing")}{" "}
                <span className="text-neutral-950">
                  {convertToLocale({
                    amount: price.target_remaining,
                    currency_code: cart.currency_code,
                  })}
                </span>{" "}
                {t("getFreeShipping")}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between gap-1">
          <div
            className={clx(
              "bg-gradient-to-r from-zinc-400 to-zinc-500 h-1 rounded-full max-w-full duration-500 ease-in-out",
              {
                "from-green-400 to-green-500": price.target_reached,
              }
            )}
            style={{ width: `${price.remaining_percentage}%` }}
          ></div>
          <div className="bg-neutral-300 h-1 rounded-full w-fit flex-grow"></div>
        </div>
      </div>
    </div>
  )
}

function FreeShippingPopup({
  cart,
  price,
  t,
}: {
  cart: StoreCart
  price: StoreFreeShippingPrice
  t: Function
}) {
  const [isClosed, setIsClosed] = useState(false)

  return (
    <div
      className={clx(
        "fixed bottom-5 right-5 flex flex-col items-end gap-2 transition-all duration-500 ease-in-out z-[100]",
        {
          "opacity-0 invisible delay-1000": price.target_reached,
          "opacity-0 invisible": isClosed,
          "opacity-100 visible": !price.target_reached && !isClosed,
        }
      )}
    >
      <div>
        <Button
          className="rounded-full bg-neutral-900 shadow-none outline-none border-none text-[15px] p-2"
          onClick={() => setIsClosed(true)}
        >
          <XMark />
        </Button>
      </div>

      <div className="small:w-[420px] ml-5 bg-black text-white p-6  rounded-[3rem] ">
        <div className="pb-4">
          <div className="space-y-3">
            <div className="flex justify-between text-[15px] text-neutral-400">
              <div>
                {price.target_reached ? (
                  <div className="flex items-center gap-1.5">
                    <CheckCircleSolid className="text-green-500 inline-block" />{" "}
                    {t("unlockedFree")}
                  </div>
                ) : (
                  <div
                    className={clx("visible", {
                      "opacity-0 invisible": price.target_reached,
                    })}
                  >
                    {t("missing")}{" "}
                    <span className="text-white">
                      {convertToLocale({
                        amount: price.target_remaining,
                        currency_code: cart.currency_code,
                      })}
                    </span>{" "}
                    {t("getFreeShipping")}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between gap-1">
              <div
                className={clx(
                  "bg-gradient-to-r from-zinc-400 to-zinc-500 h-1.5 rounded-full max-w-full duration-500 ease-in-out",
                  {
                    "from-green-400 to-green-500": price.target_reached,
                  }
                )}
                style={{ width: `${price.remaining_percentage}%` }}
              ></div>
              <div className="bg-zinc-600 h-1.5 rounded-full w-fit flex-grow"></div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <LocalizedClientLink
            className="rounded-[3rem] bg-transparent shadow-none outline-none border-[1px] border-white text-[15px] py-2.5 px-4"
            href="/cart"
          >
            {t("viewCart")}
          </LocalizedClientLink>

          <LocalizedClientLink
            className="flex-grow rounded-[3rem] bg-white text-neutral-950 shadow-none outline-none border-[1px] border-white text-[15px] py-2.5 px-4 text-center"
            href="/store"
          >
            {t("viewProducts")}
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
