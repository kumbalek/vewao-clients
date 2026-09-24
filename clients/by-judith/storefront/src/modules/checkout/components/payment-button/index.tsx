"use client"

import { isManual, isComgate } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import React, { useState } from "react"
import ErrorMessage from "../error-message"
import { useTranslations } from "next-intl"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  isPickup: boolean
  "data-testid": string
  disabled?: boolean
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  isPickup,
  "data-testid": dataTestId,
  disabled,
}) => {
  const t = useTranslations("checkout")
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1 ||
    !!disabled

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (session) => session.status === "pending"
  )

  switch (true) {
    // Pay-on-site stays unavailable if the customer switched to delivery.
    case isManual(paymentSession?.provider_id) && isPickup:
      return <OrderPaymentButton notReady={notReady} data-testid={dataTestId} />
    case isComgate(paymentSession?.provider_id):
      return <OrderPaymentButton notReady={notReady} data-testid={dataTestId} />
    default:
      return <Button disabled>{t("selectPaymentMethod")}</Button>
  }
}

const OrderPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const t = useTranslations("checkout")
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        {t("placeOrder")}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
