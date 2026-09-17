import { retrieveOrder } from "@lib/data/orders"
import OrderCanceledTemplate from "@modules/order/templates/order-canceled-template"
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
    title: t("orderCanceledTitle"),
    description: t("orderCanceledDescription"),
  }
}

export default async function OrderCanceledPage(props: Props) {
  const params = await props.params

  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    return notFound()
  }

  return <OrderCanceledTemplate order={order} />
}
