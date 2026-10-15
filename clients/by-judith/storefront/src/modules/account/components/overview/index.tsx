import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading, Text } from "@modules/design-system"

import OrderOverview from "../order-overview"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer
  orders: HttpTypes.StoreOrder[]
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const t = useTranslations("account")

  return (
    <div className="flex flex-col gap-10" data-testid="overview-page-wrapper">
      <div className="flex flex-col gap-2">
        <Heading level={1} size="lg" data-testid="welcome-message">
          {t("greeting", { name: customer.first_name || customer.email })}
        </Heading>
        <Text tone="subtle" data-testid="customer-email">
          {t("signedInAs", { email: customer.email })}
        </Text>
      </div>
      <section className="flex flex-col gap-4" aria-labelledby="recent-orders">
        <div className="flex items-baseline justify-between gap-4">
          <Heading level={2} size="md" id="recent-orders">
            {t("recentOrders")}
          </Heading>
          {orders.length > 3 && (
            <LocalizedClientLink href="/account/orders" className="text-sm underline hover:text-ink-subtle">
              {t("allOrders")}
            </LocalizedClientLink>
          )}
        </div>
        <OrderOverview orders={orders.slice(0, 3)} />
      </section>
    </div>
  )
}

export default Overview
