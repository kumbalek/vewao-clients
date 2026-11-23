import { clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"

import type { StaticVariants as StaticVariantsData } from "@lib/util/static-variants"

/**
 * The option pills of another product, for a product that bundles some of
 * its variants (owner, 2026-11-22): the included ones look chosen, the rest
 * greyed out. Information only, nothing to press. Same pill as the option
 * buttons of "Aplikace na jednotlivé partie".
 */
export default function StaticVariants({ variants }: { variants: StaticVariantsData }) {
  const t = useTranslations("product")
  const label = t("includedOption", { option: variants.title.toLocaleLowerCase("cs") })

  return (
    <div className="flex w-full flex-col gap-y-3" data-testid="static-variants">
      <span className="text-sm">{label}</span>
      <ul aria-label={label} className="flex flex-wrap gap-2">
        {variants.values.map(({ value, included }) => (
          <li
            key={value}
            data-testid="static-variant"
            data-included={included}
            className={clx(
              // The option buttons' computed size: 12 px on a 20 px line.
              "flex h-10 items-center whitespace-nowrap rounded-[3rem] border bg-ui-bg-subtle px-4 text-xs leading-5",
              included ? "border-ui-border-interactive text-ink" : "text-ink-muted opacity-50"
            )}
          >
            {value}
            <span className="sr-only"> ({included ? t("included") : t("notIncluded")})</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
