import { notFound } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import Overview from "@modules/account/components/overview"

export default async function OverviewPage() {
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) notFound()
  const orders = (await listOrders(4).catch(() => null)) ?? []

  return <Overview customer={customer} orders={orders} />
}
