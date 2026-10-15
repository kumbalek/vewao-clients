import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { useTranslations } from "next-intl"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const t = useTranslations("confirm")
  const tAccount = useTranslations("account")
  return (
    <div>
      <Text>
        {/* In the account (showStatus) the confirmation wording would not fit. */}
        {showStatus ? `${tAccount("orderEmail")}: ` : `${t("detailsSentTo")} `}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        {showStatus ? "" : "."}
      </Text>
      <Text className="mt-2">
        {`${t("orderDate")}: `}
        <span data-testid="order-date">
          {new Date(order.created_at).toLocaleDateString("cs-CZ")}
        </span>
      </Text>
      <Text className="mt-2">
        {`${t("orderNumber")}: `}
        <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              {`${t("orderStatus")}: `}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {tAccount("fulfillmentStatus", { status: order.fulfillment_status })}
              </span>
            </Text>
            <Text>
              {`${t("paymentStatus")}: `}
              <span
                className="text-ui-fg-subtle "
                data-testid="order-payment-status"
              >
                {tAccount("paymentStatusValue", { status: order.payment_status })}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
