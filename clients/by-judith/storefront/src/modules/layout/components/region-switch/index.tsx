"use client"

import { clx } from "@medusajs/ui"
import { useParams, usePathname } from "next/navigation"
import { useTransition } from "react"

import { updateRegion } from "@lib/data/cart"
import type { RegionOption } from "@lib/util/region-options"

/**
 * Where to deliver, and so which currency to pay in (vewao-clients#45):
 * moves the cart to the country's region and reloads this page under it.
 */
export default function RegionSwitch({ options, className }: { options: RegionOption[]; className?: string }) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  if (options.length < 2) return null
  // The same page under the other country: /cz/cenik → /sk/cenik.
  const rest = pathname.replace(new RegExp(`^/${countryCode}(?=/|$)`), "")

  return (
    <nav aria-label="Země doručení" className={clx("flex items-center gap-2", className)} data-testid="region-switch">
      <span>Doručení:</span>
      {options.map((option) =>
        option.countryCode === countryCode ? (
          <span key={option.countryCode} aria-current="true" className="font-semibold">
            {option.label} ({option.currencySymbol})
          </span>
        ) : (
          <button
            key={option.countryCode}
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => updateRegion(option.countryCode, rest))}
            className="underline underline-offset-2 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-current disabled:opacity-50"
          >
            {option.label} ({option.currencySymbol})
          </button>
        )
      )}
    </nav>
  )
}
