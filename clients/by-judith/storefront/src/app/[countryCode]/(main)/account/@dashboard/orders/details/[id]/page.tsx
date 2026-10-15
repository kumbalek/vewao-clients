import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { retrieveOrder } from "@lib/data/orders"
import OrderDetailsTemplate from "@modules/order/templates/order-details-template"

type Props = { params: Promise<{ id: string }> }

/** Medusa's store order route is public by ID, so the account shows only the customer's own orders. */
async function customerOrder(id: string) {
  const [customer, order] = await Promise.all([
    retrieveCustomer().catch(() => null),
    retrieveOrder(id).catch(() => null),
  ])
  return customer && order?.customer_id === customer.id ? order : null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const order = await customerOrder((await props.params).id)
  if (!order) notFound()
  const t = await getTranslations("metadata")
  return { title: t("orderTitle", { orderId: order.display_id ?? "" }), description: t("orderDescription") }
}

export default async function OrderDetailPage(props: Props) {
  const order = await customerOrder((await props.params).id)
  if (!order) notFound()

  return <OrderDetailsTemplate order={order} />
}
