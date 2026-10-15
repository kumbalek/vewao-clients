type PrefillOrder = {
  display_id?: number | null
  items?: { quantity: number; title?: string | null; product_title?: string | null }[] | null
}
type PrefillCustomer = { first_name?: string | null; last_name?: string | null; email: string }

/** Withdrawal form values for a signed-in customer's own order (the account's "Vrátit zboží"). */
export function withdrawalPrefill(order: PrefillOrder, customer: PrefillCustomer) {
  return {
    order_reference: String(order.display_id ?? ""),
    customer_name: [customer.first_name, customer.last_name].filter(Boolean).join(" "),
    email: customer.email,
    items: (order.items ?? [])
      .map((item) => `${item.quantity}× ${item.product_title || item.title || ""}`.trim())
      .join("\n"),
  }
}
