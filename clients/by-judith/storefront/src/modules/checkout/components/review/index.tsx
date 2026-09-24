"use client"

import { useState } from "react"
import { Heading, Text, clx } from "@medusajs/ui"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Label, Switch } from "@medusajs/ui"
import InteractiveLink from "@modules/common/components/interactive-link"

const Review = ({ cart, isPickup }: { cart: any; isPickup: boolean }) => {
  const [acceptAgreement, setAccept] = useState(false)
  const t = useTranslations("checkout")
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          {t("review")}
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <div className="flex flex-col small:flex-row justify-between items-start small:items-center gap-4 mb-4">
                <Text className="txt-medium-plus text-ui-fg-base mb-1 max-w-64">
                  {t("agreeText")}
                </Text>
                <InteractiveLink newTab={true} href="/content/terms-of-use">
                  {t("agreeLink")}
                </InteractiveLink>
              </div>
              <div className="flex items-center gap-x-2">
                <Switch
                  id="accept-agreement"
                  checked={acceptAgreement}
                  onCheckedChange={setAccept}
                />
                <Label htmlFor="accept-agreement">{t("agreeLabel")}</Label>
              </div>
            </div>
          </div>
          <PaymentButton
            cart={cart}
            isPickup={isPickup}
            data-testid="submit-order-button"
            disabled={!acceptAgreement}
          />
        </>
      )}
    </div>
  )
}

export default Review
