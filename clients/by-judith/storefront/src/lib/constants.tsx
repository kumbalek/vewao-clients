import React from "react"
import { CreditCard, Cash } from "@medusajs/icons"

import PayPal from "@modules/common/icons/paypal"

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  {
    title: string
    icon: React.JSX.Element
    details: (amount: string, date: string) => string
  }
> = {
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <PayPal />,
    details: () => "",
  },
  pp_system_default: {
    title: "Osobní platba",
    icon: <Cash />,
    details: () => "Hotově nebo kartou na prodejně",
  },
  pp_comgate_comgate: {
    title: "Platba kartou – Comgate",
    icon: <CreditCard />,
    details: (amount: string, date: string) => `${amount}${date}`,
  },
  // Add more payment providers here
}

export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}
export { isManual, isComgate } from "./util/payment-methods"

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]
