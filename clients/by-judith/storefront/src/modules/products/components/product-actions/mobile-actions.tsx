import { Dialog, Transition } from "@headlessui/react"
import { Button, clx } from "@medusajs/ui"
import React, { Fragment, useMemo } from "react"
import { useTranslations } from "next-intl"

import useToggleState from "@lib/hooks/use-toggle-state"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"

import { claimForPrice, type PriceReference } from "@lib/util/discount-claim"
import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { VariantOptions } from "./variant-options"
import { HttpTypes } from "@medusajs/types"
import { isSimpleProduct } from "@lib/util/product"
import { hasPriceRange } from "@lib/util/price-range"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  /** The chosen option values, or null before a choice. */
  selectionLabel: string | null
  /** Several variants chosen: their total instead of the variant's price. */
  priceOverride?: string | null
  /** The page's add-to-cart control (vewao-clients#75). */
  cartControl: React.ReactNode
  show: boolean
  optionsDisabled: boolean
  priceReferences?: PriceReference[]
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  selectionLabel,
  priceOverride,
  cartControl,
  show,
  optionsDisabled,
  priceReferences,
}) => {
  const t = useTranslations("cart")
  const tProduct = useTranslations("product")
  const { state, open, close } = useToggleState()

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  const claim = priceOverride ? null : claimForPrice(selectedPrice, priceReferences)

  const isSimple = isSimpleProduct(product)

  return (
    <>
      <div
        className={clx("z-50 lg:hidden inset-x-0 bottom-0 fixed", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="bg-white flex flex-col gap-y-3 justify-center items-center text-large-regular p-4 h-full w-full border-t border-gray-200"
            data-testid="mobile-actions"
          >
            <div className="flex items-center gap-x-2">
              <span data-testid="mobile-title">{product.title}</span>
              <span>—</span>
              {selectedPrice ? (
                <div className="flex items-end gap-x-2 text-ui-fg-base">
                  {claim && (
                    <p>
                      <span className="line-through text-small-regular">
                        {convertToLocale({
                          amount: claim.referenceAmount,
                          currency_code: selectedPrice.currency_code,
                        })}
                      </span>
                    </p>
                  )}
                  <span
                    className={clx({
                      "text-ui-fg-interactive": !!claim,
                    })}
                  >
                    {!variant && !priceOverride && hasPriceRange(product) && `${tProduct("priceFrom")} `}
                    {priceOverride ?? selectedPrice.calculated_price}
                  </span>
                </div>
              ) : (
                <div></div>
              )}
            </div>
            <div
              className={clx("grid grid-cols-2 w-full gap-x-4", {
                "!grid-cols-1": isSimple,
              })}
            >
              {!isSimple && (
                <Button
                  onClick={open}
                  variant="secondary"
                  className="w-full"
                  data-testid="mobile-actions-button"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{selectionLabel ?? t("selectVariant")}</span>
                    <ChevronDown />
                  </div>
                </Button>
              )}
              {cartControl}
            </div>
          </div>
        </Transition>
      </div>
      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-700 bg-opacity-75 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed bottom-0 inset-x-0">
            <div className="flex min-h-full h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel
                  className="w-full h-full transform overflow-hidden text-left flex flex-col gap-y-3"
                  data-testid="mobile-actions-modal"
                >
                  <div className="w-full flex justify-end pr-6">
                    <button
                      onClick={close}
                      className="bg-white w-12 h-12 rounded-full text-ui-fg-base flex justify-center items-center"
                      data-testid="close-modal-button"
                    >
                      <X />
                    </button>
                  </div>
                  <div className="bg-white px-6 py-12">
                    {/* The page's shared choice (vewao-clients#70), several at once where allowed. */}
                    <VariantOptions product={product} disabled={optionsDisabled} />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileActions
