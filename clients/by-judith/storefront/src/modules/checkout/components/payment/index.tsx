"use client"

import { RadioGroup } from "@headlessui/react"
import { isComgate as isComgateFunc, paymentInfoMap } from "@lib/constants"
import { availablePaymentMethods as filterPaymentMethods } from "@lib/util/payment-methods"
import { initiatePaymentSession } from "@lib/data/cart"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { Button, Container, Heading, Text, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer from "@modules/checkout/components/payment-container"
import type { HttpTypes } from "@medusajs/types"
import Divider from "@modules/common/components/divider"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState, useMemo } from "react"
import { useTranslations } from "next-intl"

const Payment = ({
  cart,
  availablePaymentMethods,
  isPickup,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: HttpTypes.StorePaymentProvider[]
  isPickup: boolean
}) => {
  const t = useTranslations("checkout")
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession) => paymentSession.status === "pending"
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"
  const paymentFailed = searchParams.get("payment") === "failed"

  const isComgate = isComgateFunc(selectedPaymentMethod)

  const filteredPaymentMethods = useMemo(
    () => filterPaymentMethods(availablePaymentMethods, isPickup),
    [availablePaymentMethods, isPickup]
  )

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
  }

  // A pay-on-site session left over from pickup does not count for delivery.
  const activeSessionAllowed =
    !!activeSession &&
    filteredPaymentMethods.some(
      (method) => method.id === activeSession.provider_id
    )
  const paymentReady =
    activeSessionAllowed && (cart.shipping_methods?.length ?? 0) > 0

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      params.delete("payment")

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    const { id, email } = cart

    const { first_name, last_name } = cart.billing_address ?? {}
    if (
      !filteredPaymentMethods.some(
        (method) => method.id === selectedPaymentMethod
      )
    )
      return

    setIsLoading(true)
    try {
      const checkActiveSession =
        activeSessionAllowed &&
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
          data: {
            cart_id: id,
            email,
            first_name,
            last_name,
          },
        })
      }

      return router.push(pathname + "?" + createQueryString("step", "review"), {
        scroll: false,
      })
    } catch {
      // Gateway errors are technical and in English; the backend logs them.
      setError(t("paymentSetupFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  useEffect(() => {
    if (
      selectedPaymentMethod &&
      !filteredPaymentMethods.some(
        (method) => method.id === selectedPaymentMethod
      )
    ) {
      setSelectedPaymentMethod("")
    }
  }, [filteredPaymentMethods, selectedPaymentMethod])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          {t("payment")}
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              {t("edit")}
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {paymentFailed && (
            <p
              role="alert"
              className="mb-4 text-small-regular text-rose-500"
              data-testid="payment-failed-message"
            >
              {t("paymentFailed")}
            </p>
          )}
          {filteredPaymentMethods.length > 0 && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
              >
                {filteredPaymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    <PaymentContainer
                      paymentInfoMap={paymentInfoMap}
                      paymentProviderId={paymentMethod.id}
                      selectedPaymentOptionId={selectedPaymentMethod}
                    />
                  </div>
                ))}
              </RadioGroup>
            </>
          )}

          {filteredPaymentMethods.length === 0 && (
            <p role="status">
              Pro tuto dopravu není dostupná platba. Zvolte jinou dopravu nebo
              nás kontaktujte.
            </p>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!selectedPaymentMethod}
            data-testid="submit-payment-button"
          >
            {t("continueToReview")}
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  {t("paymentMethod")}
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
                </Text>
              </div>
              {isComgate && (
                <div className="flex flex-col w-1/3">
                  <Text className="txt-medium-plus text-ui-fg-base mb-1">
                    {t("paymentDetails")}
                  </Text>
                  <div
                    className="flex gap-2 txt-medium text-ui-fg-subtle items-center"
                    data-testid="payment-details-summary"
                  >
                    <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                      {paymentInfoMap[selectedPaymentMethod]?.icon || (
                        <CreditCard />
                      )}
                    </Container>
                    <Text>{t("anotherPaymentStep")}</Text>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
