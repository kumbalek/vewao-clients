import { HttpTypes } from "@medusajs/types"
import { getTranslations } from "next-intl/server"

import CartTotals from "@modules/common/components/cart-totals"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ButtonLink, Card, Heading, Text } from "@modules/design-system"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import PaymentDetails from "@modules/order/components/payment-details"
import ShippingDetails from "@modules/order/components/shipping-details"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

/** A customer's order in their account, with the way to return it. */
export default async function OrderDetailsTemplate({ order }: OrderDetailsTemplateProps) {
  const t = await getTranslations("account")

  return (
    <div className="flex flex-col gap-y-6" data-testid="order-details-container">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Heading level={1} size="lg">
          {t("orderNumber", { number: order.display_id ?? "" })}
        </Heading>
        <LocalizedClientLink
          href="/account/orders"
          className="text-sm text-ink-subtle underline hover:text-ink"
          data-testid="back-to-overview-button"
        >
          {t("backToOrders")}
        </LocalizedClientLink>
      </div>
      <OrderDetails order={order} showStatus />
      <Items order={order} />
      <CartTotals totals={order} />
      <ShippingDetails order={order} />
      <PaymentDetails order={order} />
      {order.status !== "canceled" && (
        <Card tone="surface" className="flex flex-col gap-3" data-testid="order-return">
          <Heading level={2} size="sm">
            {t("returnTitle")}
          </Heading>
          <Text size="sm" tone="subtle">
            {t("returnText")}
          </Text>
          <div>
            <ButtonLink
              href={`/odstoupeni-od-smlouvy?objednavka=${order.display_id}`}
              variant="secondary"
              data-testid="order-return-button"
            >
              {t("returnButton")}
            </ButtonLink>
          </div>
        </Card>
      )}
      <Help />
    </div>
  )
}
