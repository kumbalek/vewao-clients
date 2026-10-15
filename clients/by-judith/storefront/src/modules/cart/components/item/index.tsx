"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import DeleteButton from "@modules/common/components/delete-button"
// import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useCallback, useState } from "react"

import { useDelayedRefresh } from "@lib/hooks/use-delayed-refresh"
import { isGiftPackaging as isGift } from "@lib/util/gift-packaging"


type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [busyLine, setBusyLine] = useState<"update" | "delete" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { delayedRefresh, isRefreshing } = useDelayedRefresh()
  const isGiftPackaging = isGift(item)

  const isBusy = busyLine !== null || isRefreshing
  const handleDeleteBusyChange = useCallback((deleteBusy: boolean) => {
    setBusyLine((current) =>
      deleteBusy ? "delete" : current === "delete" ? null : current
    )
  }, [])

  const changeQuantity = async (quantity: number) => {
    if (isBusy) {
      return
    }
    setBusyLine("update")
    setError(null)

    try {
      await updateLineItem({ lineId: item.id, quantity })
      await delayedRefresh()
    } catch {
      setError("Aktualizace množství se nepodařila. Zkuste to prosím znovu.")
    } finally {
      setBusyLine(null)
    }
  }

  const maxQuantity = Math.max(item.quantity + 10, 20)

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="p-4 w-24">
        {isGiftPackaging ? (
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        ) : (
          <LocalizedClientLink
            href={`/products/${item.product_handle}`}
            className={clx("flex", {
              "w-16": type === "preview",
              "small:w-24 w-12": type === "full",
            })}
          >
            <Thumbnail
              thumbnail={item.thumbnail}
              images={item.variant?.product?.images}
              size="square"
            />
          </LocalizedClientLink>
        )}
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        {/* <LineItemOptions variant={item.variant} data-testid="product-variant" /> */}
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center w-28">
            <DeleteButton
              id={item.id}
              data-testid="product-delete-button"
              aria-label={`Odebrat ${item.product_title}`}
              disabled={isBusy}
              onBusyChange={handleDeleteBusyChange}
            />
            <CartItemSelect
              value={item.quantity}
              onChange={(value) => changeQuantity(parseInt(value.target.value))}
              className="w-14 h-10 p-4"
              data-testid="product-select-button"
              aria-label={`Množství produktu ${item.product_title}`}
              disabled={isGiftPackaging || isBusy}
            >
              {Array.from(
                {
                  length: maxQuantity,
                },
                (_, i) => (
                  <option value={i + 1} key={i}>
                    {i + 1}
                  </option>
                )
              )}
            </CartItemSelect>
            {busyLine === "update" && <Spinner />}
          </div>
          {error && (
            <p
              data-testid="product-error-message"
              role="alert"
              className="pt-2 text-rose-500 text-small-regular"
            >
              {error}
            </p>
          )}
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell className="">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex items-center gap-x-1 ">
              <span>{item.quantity}x </span>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
