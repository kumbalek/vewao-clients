import { Heading } from "@medusajs/ui"
import { getTranslations } from "next-intl/server"

import Help from "@modules/order/components/help"
import OrderDetails from "@modules/order/components/order-details"
import { HttpTypes } from "@medusajs/types"

type OrderCanceledTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCanceledTemplate({
  order,
}: OrderCanceledTemplateProps) {
  const t = await getTranslations("confirm")

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            {t("canceledTitle")}
          </Heading>
          <OrderDetails order={order} />
          <Help />
        </div>
      </div>
    </div>
  )
}
