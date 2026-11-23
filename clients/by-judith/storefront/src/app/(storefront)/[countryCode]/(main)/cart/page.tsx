import { getTranslations } from "next-intl/server"

import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { retrieveGiftPackaging } from "@lib/data/gift-packaging"
import { listPromotionTiers } from "@lib/data/promotion-tiers"
import { listRunningSaleLabels } from "@lib/data/sale-labels"
import { saleLabelsForCart } from "@lib/util/sale-labels"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  return {
    title: t("cartTitle"),
    description: t("cartDescription"),
  }
}

export default async function Cart(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })

  const [customer, promotionTiers, giftPackaging, sales] = await Promise.all([
    retrieveCustomer(),
    listPromotionTiers(),
    retrieveGiftPackaging(countryCode),
    listRunningSaleLabels(),
  ])

  return (
    <CartTemplate
      cart={cart}
      customer={customer}
      promotionTiers={promotionTiers}
      giftPackaging={giftPackaging}
      activeSales={saleLabelsForCart(sales.labels, sales.active, cart)}
    />
  )
}
