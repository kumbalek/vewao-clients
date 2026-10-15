import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

import { ButtonLink, Card, Text } from "@modules/design-system"

import OrderCard from "../order-card"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  const t = useTranslations("account")

  if (!orders.length) {
    return (
      <Card tone="surface" className="flex flex-col items-start gap-4" data-testid="no-orders-container">
        <Text>{t("noOrders")}</Text>
        <ButtonLink href="/store" data-testid="continue-shopping-button">
          {t("continueShopping")}
        </ButtonLink>
      </Card>
    )
  }

  return (
    <ul className="flex flex-col gap-4" data-testid="orders-wrapper">
      {orders.map((order) => (
        <li key={order.id} data-testid="order-wrapper" data-value={order.id}>
          <OrderCard order={order} />
        </li>
      ))}
    </ul>
  )
}

export default OrderOverview
