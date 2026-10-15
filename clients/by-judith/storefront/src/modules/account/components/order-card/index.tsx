import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text } from "@modules/design-system"
import Thumbnail from "@modules/products/components/thumbnail"

const orderDate = new Intl.DateTimeFormat("cs-CZ", { dateStyle: "long", timeZone: "Europe/Prague" })

/** One order in the account: number, date, total and the first items, linking to its detail. */
const OrderCard = ({ order }: { order: HttpTypes.StoreOrder }) => {
  const t = useTranslations("account")
  const items = order.items ?? []
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const hidden = items.length - 3

  return (
    <LocalizedClientLink
      href={`/account/orders/details/${order.id}`}
      className="flex flex-col gap-4 rounded-popover border border-line p-5 transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      data-testid="order-card"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className="text-lg text-ink" data-testid="order-display-id">
          {t("orderNumber", { number: order.display_id ?? "" })}
        </span>
        <Text as="span" size="sm" tone="subtle">
          <span data-testid="order-created-at">{orderDate.format(new Date(order.created_at))}</span>
          {" · "}
          <span data-testid="order-amount">
            {convertToLocale({ amount: order.total, currency_code: order.currency_code })}
          </span>
          {" · "}
          {t("itemCount", { count: quantity })}
        </Text>
      </div>
      <ul className="flex flex-wrap items-center gap-3">
        {items.slice(0, 3).map((item) => (
          <li key={item.id} className="flex items-center gap-3" data-testid="order-item">
            <div className="w-14 flex-none">
              <Thumbnail thumbnail={item.thumbnail} images={[]} size="square" />
            </div>
            <Text as="span" size="sm">
              <span data-testid="item-title">{item.product_title ?? item.title}</span>{" "}
              <span className="text-ink-muted">× <span data-testid="item-quantity">{item.quantity}</span></span>
            </Text>
          </li>
        ))}
        {hidden > 0 && (
          <li>
            <Text as="span" size="sm" tone="muted">
              {t("moreItems", { count: hidden })}
            </Text>
          </li>
        )}
      </ul>
    </LocalizedClientLink>
  )
}

export default OrderCard
