/**
 * A product's place in the cart, for the add-to-cart control (vewao-clients#75):
 * how many of it the cart holds across all its variants, and the line that
 * minus takes one from, the most recently added one (owner, 2026-11-24).
 */

export type CartLineLike = {
  id: string
  product_id?: string | null
  quantity?: number | null
  created_at?: string | Date | null
}

export type CartLineRef = { id: string; quantity: number }

export type ProductCartState = {
  quantity: number
  /** The line minus takes one from, or null when the product is not in the cart. */
  lastLine: CartLineRef | null
}

export const EMPTY_PRODUCT_CART_STATE: ProductCartState = { quantity: 0, lastLine: null }

/** Only what the controls read, so the layout does not send whole line items to the browser. */
export function cartLinesOf(items: ReadonlyArray<CartLineLike> | null | undefined): CartLineLike[] {
  return (items ?? []).map(({ id, product_id, quantity, created_at }) => ({ id, product_id, quantity, created_at }))
}

const time = (value: CartLineLike["created_at"]) => {
  const ms = value instanceof Date ? value.getTime() : value ? Date.parse(value) : NaN
  return Number.isFinite(ms) ? ms : -Infinity
}

const positive = (quantity: CartLineLike["quantity"]) => {
  const n = Number(quantity)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
}

/** Every product's state at once; products without a positive quantity are left out. */
export function productCartStates(lines: ReadonlyArray<CartLineLike | null | undefined> | null | undefined) {
  const states = new Map<string, ProductCartState>()
  const lastTime = new Map<string, number>()
  for (const line of lines ?? []) {
    const productId = line?.product_id
    const quantity = positive(line?.quantity)
    if (!line || !productId || !quantity) continue
    const state = states.get(productId) ?? { quantity: 0, lastLine: null }
    state.quantity += quantity
    // A later line wins; on equal times the later one in the cart's order does.
    const at = time(line.created_at)
    if (!state.lastLine || at >= (lastTime.get(productId) ?? -Infinity)) {
      state.lastLine = { id: line.id, quantity }
      lastTime.set(productId, at)
    }
    states.set(productId, state)
  }
  return states
}

/**
 * What minus does to the cart: lower the line's quantity, or remove the line
 * when it holds the last one.
 */
export function removeOneAction(line: CartLineRef): { kind: "update"; lineId: string; quantity: number } | { kind: "delete"; lineId: string } {
  return line.quantity > 1
    ? { kind: "update", lineId: line.id, quantity: line.quantity - 1 }
    : { kind: "delete", lineId: line.id }
}
