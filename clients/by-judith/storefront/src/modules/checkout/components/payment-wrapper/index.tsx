import type { ReactNode } from "react"
import type { HttpTypes } from "@medusajs/types"

export default function PaymentWrapper({
  children,
}: {
  cart: HttpTypes.StoreCart
  children: ReactNode
}) {
  return <div>{children}</div>
}
