"use client"

import { Transition } from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ButtonLink } from "@modules/design-system"
import { BagIcon } from "@modules/design-system/components/icons"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

const GIFT_VARIANT_ID = process.env.NEXT_PUBLIC_GIFT_PACKAGING_VARIANT_ID

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const t = useTranslations("cart")
  const tLayout = useTranslations("layout")
  const [activeTimer, setActiveTimer] = useState<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const total = cartState?.total ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()

    const timer = setTimeout(close, 5000)

    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }

    open()
  }

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <div
      className="relative z-50 flex h-full items-center"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <LocalizedClientLink
        href="/cart"
        data-testid="nav-cart-link"
        aria-label={tLayout("cartWithCount", { count: totalItems })}
        className="relative flex flex-col items-center gap-0.5 text-ink hover:text-ink-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink overlay:text-white overlay:hover:text-white/80 overlay:focus-visible:outline-white"
      >
        <BagIcon size={24} />
        <span
          aria-hidden="true"
          data-testid="nav-cart-count"
          className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-action px-1 text-[10px] leading-none text-white overlay:bg-white overlay:text-ink"
        >
          {totalItems}
        </span>
        <span aria-hidden="true" className="hidden text-xs text-ink-subtle medium:block overlay:text-white/85">
          {tLayout("cart")}
        </span>
      </LocalizedClientLink>
      <Transition
        show={cartDropdownOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <div
          className="absolute right-0 top-[calc(100%+1px)] hidden w-[420px] border-x border-b border-line bg-white text-ink small:block"
          data-testid="nav-cart-dropdown"
        >
          <div className="p-4 flex items-center justify-center">
            <h3 className="text-large ">{t("title")}</h3>
          </div>
          {cartState && cartState.items?.length ? (
            <>
              <div className="overflow-y-scroll max-h-[402px] px-4 grid grid-cols-1 gap-y-8 no-scrollbar p-px">
                {cartState.items
                  .sort((a, b) => {
                    return (a.created_at ?? "") > (b.created_at ?? "")
                      ? -1
                      : 1
                  })
                  .map((item) => {
                    const isGiftPackaging =
                      item.variant_id === GIFT_VARIANT_ID
                    return (
                      <div
                        className="grid grid-cols-[122px_1fr] gap-x-4"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        {isGiftPackaging ? (
                          <div className="w-24">
                            <Thumbnail
                              thumbnail={item.thumbnail}
                              images={item.variant?.product?.images}
                              size="square"
                            />
                          </div>
                        ) : (
                          <LocalizedClientLink
                            href={`/products/${item.product_handle}`}
                            className="w-24"
                          >
                            <Thumbnail
                              thumbnail={item.thumbnail}
                              images={item.variant?.product?.images}
                              size="square"
                            />
                          </LocalizedClientLink>
                        )}
                        <div className="flex flex-col justify-between flex-1">
                          <div className="flex flex-col flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4 w-[180px]">
                                <h3 className="text-base-regular overflow-hidden text-ellipsis">
                                  {isGiftPackaging ? (
                                    item.title
                                  ) : (
                                    <LocalizedClientLink
                                      href={`/products/${item.product_handle}`}
                                      data-testid="product-link"
                                    >
                                      {item.title}
                                    </LocalizedClientLink>
                                  )}
                                </h3>
                                <span
                                  data-testid="cart-item-quantity"
                                  data-value={item.quantity}
                                >
                                  {`${t("quantity")}: ${item.quantity}`}
                                </span>
                              </div>
                              <div className="flex justify-end">
                                <LineItemPrice
                                  item={item}
                                  style="tight"
                                  currencyCode={cartState.currency_code}
                                />
                              </div>
                            </div>
                          </div>
                          <DeleteButton
                            id={item.id}
                            className="mt-1"
                            data-testid="cart-item-remove-button"
                          >
                            {t("remove")}
                          </DeleteButton>
                        </div>
                      </div>
                    )
                  })}
              </div>
              <div className="p-4 flex flex-col gap-y-4 text-small-regular">
                <div className="flex items-center justify-between">
                  <span className="text-ink font-semibold">{t("total")}</span>
                  <span
                    className="text-large "
                    data-testid="cart-subtotal"
                    data-value={total}
                  >
                    {convertToLocale({
                      amount: total,
                      currency_code: cartState.currency_code,
                    })}
                  </span>
                </div>
                <ButtonLink
                  href="/cart"
                  size="lg"
                  fullWidth
                  data-testid="go-to-cart-button"
                >
                  {t("goToCart")}
                </ButtonLink>
              </div>
            </>
          ) : (
            <div className="flex py-16 flex-col gap-y-4 items-center justify-center">
              <span>{t("cartIsEmpty")}</span>
              <ButtonLink href="/store" variant="secondary">
                {t("exploreProductsButton")}
              </ButtonLink>
            </div>
          )}
        </div>
      </Transition>
    </div>
  )
}

export default CartDropdown
