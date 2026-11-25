import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table } from "@medusajs/ui"
import { useTranslations } from "next-intl"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const t = useTranslations("cart")

  const items = cart?.items
  return (
    <div className="relative w-full overflow-y-scroll">
      <div className="pb-3 flex items-center">
        <Heading className="text-[2rem] leading-[2.75rem]">
          {t("title")}
        </Heading>
      </div>
      {/* Below 1024px the rows are two-column grids, so a phone needs no
          sideways scroll: the photo over the title on the left, the quantity
          over the line total on the right (owner, 2026-11-25). */}
      <Table className="max-small:block">
        <Table.Header className="border-t-0 max-small:block">
          <Table.Row className="text-ui-fg-subtle txt-medium-plus max-small:grid max-small:grid-cols-[minmax(0,1fr)_auto] max-small:items-center max-small:gap-x-4 max-small:px-4 max-small:py-2">
            <Table.HeaderCell className="max-small:row-span-2 max-small:h-auto max-small:!p-0">
              {t("item")}
            </Table.HeaderCell>
            <Table.HeaderCell className="max-small:hidden"></Table.HeaderCell>
            <Table.HeaderCell className="max-small:h-auto max-small:!p-0 max-small:text-right">
              {t("quantity")}
            </Table.HeaderCell>
            <Table.HeaderCell className="hidden small:table-cell">
              {t("price")}
            </Table.HeaderCell>
            <Table.HeaderCell className="text-right max-small:h-auto max-small:!p-0">
              {t("total")}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body className="max-small:block">
          {items
            ? items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => {
                  return (
                    <Item
                      key={item.id}
                      item={item}
                      currencyCode={cart?.currency_code}
                    />
                  )
                })
            : repeat(2).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default ItemsTemplate
