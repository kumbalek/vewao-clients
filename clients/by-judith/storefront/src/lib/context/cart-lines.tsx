"use client"

import { useParams, useRouter } from "next/navigation"
import { createContext, useCallback, useContext, useMemo, useOptimistic, useState, useTransition } from "react"

import { addToCart, deleteLineItem, updateLineItem } from "@lib/data/cart"
import {
  EMPTY_PRODUCT_CART_STATE,
  productCartStates,
  removeOneAction,
  type CartLineLike,
  type ProductCartState,
} from "@lib/util/cart-product-state"

const CartLinesContext = createContext<Map<string, ProductCartState> | null>(null)

/**
 * The cart's lines per product, for the add-to-cart controls on product pages
 * and product cards (vewao-clients#75). The layout passes the cart it already
 * reads; a cart change re-renders the layout, which brings the new lines.
 */
export function CartLinesProvider({ lines, children }: { lines: CartLineLike[]; children: React.ReactNode }) {
  const states = useMemo(() => productCartStates(lines), [lines])
  return <CartLinesContext.Provider value={states}>{children}</CartLinesContext.Provider>
}

/**
 * A product's quantity in the cart, with add and minus. The count changes at
 * once and stays until the cart re-renders with the server's lines.
 */
export function useProductCart(productId: string | undefined) {
  const states = useContext(CartLinesContext)
  const state = (productId && states?.get(productId)) || EMPTY_PRODUCT_CART_STATE
  const countryCode = useParams().countryCode as string
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [quantity, shift] = useOptimistic(state.quantity, (current: number, delta: number) => Math.max(0, current + delta))
  const [failed, setFailed] = useState(false)

  const run = useCallback(
    (delta: number, change: () => Promise<void>) =>
      new Promise<boolean>((resolve) => {
        startTransition(async () => {
          shift(delta)
          setFailed(false)
          try {
            await change()
            // The actions expire the cart's cache; this brings the new lines and totals.
            startTransition(() => router.refresh())
            resolve(true)
          } catch (error) {
            console.error("Cart update failed", error)
            setFailed(true)
            resolve(false)
          }
        })
      }),
    [router, shift]
  )

  /** Adds one of each variant, each as its own line, in order. */
  const add = useCallback(
    (variantIds: string[]) =>
      run(variantIds.length, async () => {
        for (const variantId of variantIds) {
          await addToCart({ variantId, quantity: 1, countryCode })
        }
      }),
    [run, countryCode]
  )

  /** Takes one from the most recently added line of this product. */
  const removeOne = useCallback(() => {
    const line = state.lastLine
    if (!line) return Promise.resolve(false)
    const action = removeOneAction(line)
    return run(-1, () =>
      action.kind === "delete" ? deleteLineItem(action.lineId) : updateLineItem({ lineId: action.lineId, quantity: action.quantity })
    )
  }, [run, state.lastLine])

  return { quantity, add, removeOne, isPending, failed }
}
