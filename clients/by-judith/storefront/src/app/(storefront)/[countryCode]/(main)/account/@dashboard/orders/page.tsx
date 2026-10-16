import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { listOrders } from "@lib/data/orders"
import OrderOverview from "@modules/account/components/order-overview"
import { Heading, Text } from "@modules/design-system"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return { title: t("ordersTitle"), description: t("ordersDescription") }
}

export default async function Orders() {
  const t = await getTranslations("account")
  const orders = (await listOrders(50).catch(() => null)) ?? []

  return (
    <div className="flex flex-col gap-8" data-testid="orders-page-wrapper">
      <div className="flex flex-col gap-2">
        <Heading level={1} size="lg">
          {t("orders")}
        </Heading>
        <Text tone="subtle">{t("ordersText")}</Text>
      </div>
      <OrderOverview orders={orders} />
    </div>
  )
}
