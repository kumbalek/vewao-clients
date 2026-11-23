import { clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"

import type { SaleLabel } from "@lib/util/sale-labels"
import { InfoTip } from "@modules/design-system"

/** The lit discount box of the Ultherapy areas (vewao-clients#70), so every sale looks alike. */
const LIT = "border border-gold bg-white text-ink"
const GLOW = "shadow-[0_0_0_1px_#D7B46B,0_0_24px_rgb(215_180_107/0.55)]"
const SMALL_GLOW = "shadow-[0_0_0_1px_#D7B46B,0_0_16px_rgb(215_180_107/0.45)]"

/**
 * Running sales' labels from the CMS (owner, 2026-11-22). `box`: a lit box
 * with the label and its description, on product pages and in the cart.
 * `chip`: the label alone beside a category's title, the description behind
 * an "i".
 */
export default function SaleLabels({
  labels,
  variant = "box",
  className,
}: {
  labels: SaleLabel[]
  variant?: "box" | "chip"
  className?: string
}) {
  const t = useTranslations("product")
  if (!labels.length) return null

  if (variant === "chip") {
    return (
      <ul className={clx("flex flex-wrap gap-2", className)} data-testid="sale-labels">
        {labels.map((sale) => (
          <li
            key={sale.code}
            data-testid="sale-label"
            className={clx(LIT, SMALL_GLOW, "inline-flex items-center gap-2 rounded-chip px-3 py-1.5 text-sm leading-5")}
          >
            <span className="whitespace-nowrap">{sale.label}</span>
            {sale.description && <InfoTip label={t("saleInfo")}>{sale.description}</InfoTip>}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className={clx("flex w-full flex-col gap-3", className)} data-testid="sale-labels">
      {labels.map((sale) => (
        <li
          key={sale.code}
          data-testid="sale-label"
          className={clx(LIT, GLOW, "flex flex-col items-center justify-center gap-1 rounded-popover px-4 py-4 text-center")}
        >
          <span className="text-2xl leading-none">{sale.label}</span>
          {sale.description && <span className="text-xs leading-snug">{sale.description}</span>}
        </li>
      ))}
    </ul>
  )
}
