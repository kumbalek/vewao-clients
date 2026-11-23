"use client"

import { clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"

import { reachedTier, type ProductTier } from "@lib/util/product-tiers"

/**
 * A product's volume discounts as boxes under its options (vewao-clients#70,
 * the Christmas sale on Ultherapy's areas): each box shows a tier, greyed out
 * until the choice reaches it, then lit with a gold glow. Only one is lit, as
 * the cart applies one tier. The caption is the promotion's teaser text, set
 * in admin.
 */
export default function DiscountBoxes({ tiers, count }: { tiers: ProductTier[]; count: number }) {
  const t = useTranslations("product")
  const reached = reachedTier(tiers, count)
  if (!tiers.length) return null

  return (
    <ul className="grid grid-cols-2 gap-3" data-testid="discount-boxes">
      {tiers.map((tier) => {
        const lit = tier.code === reached?.code
        return (
          <li
            key={tier.code}
            data-testid="discount-box"
            data-active={lit}
            className={clx(
              "flex flex-col items-center justify-center gap-1 rounded-popover border px-4 py-4 text-center transition-all duration-300",
              lit
                ? "border-gold bg-white text-ink shadow-[0_0_0_1px_#D7B46B,0_0_24px_rgb(215_180_107/0.55)]"
                : "border-dashed border-line bg-surface text-ink-muted opacity-60"
            )}
          >
            <span className="text-2xl leading-none">−{tier.value} %</span>
            <span className="text-xs leading-snug">
              {tier.teaser ?? t("tierFrom", { count: tier.min_count })}
            </span>
            {lit && <span className="sr-only">{t("tierApplies")}</span>}
          </li>
        )
      })}
    </ul>
  )
}
