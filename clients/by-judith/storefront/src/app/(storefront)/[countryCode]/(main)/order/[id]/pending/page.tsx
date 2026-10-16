import { retrieveOrder } from "@lib/data/orders"
import OrderPendingTemplate from "@modules/order/templates/order-pending-template"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  return {
    title: t("orderPendingTitle"),
    description: t("orderPendingDescription"),
  }
}

export default async function OrderPendingPage(props: Props) {
  const params = await props.params

  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    return notFound()
  }

  return <OrderPendingTemplate order={order} />
}
