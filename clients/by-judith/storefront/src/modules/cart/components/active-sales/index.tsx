import { Heading } from "@medusajs/ui"
import { useTranslations } from "next-intl"

import type { SaleLabel } from "@lib/util/sale-labels"
import SaleLabels from "@modules/common/components/sale-labels"

/** "Aktivní slevy" under the cart's summary: the sales this cart gets (owner, 2026-11-22). */
export default function ActiveSales({ labels }: { labels: SaleLabel[] }) {
  const t = useTranslations("cart")
  if (!labels.length) return null

  return (
    <section className="flex flex-col gap-y-4 bg-white" aria-labelledby="active-sales-heading" data-testid="active-sales">
      <Heading level="h2" id="active-sales-heading" className="text-xl leading-8">
        {t("activeSales")}
      </Heading>
      <SaleLabels labels={labels} />
    </section>
  )
}
