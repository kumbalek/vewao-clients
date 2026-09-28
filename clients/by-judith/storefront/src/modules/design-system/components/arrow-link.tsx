import { ArrowUpRightMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import React from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type ArrowLinkProps = {
  /** A shop path without the country code, e.g. "/collections/gold-edition". */
  href: string
  className?: string
  children: React.ReactNode
  "data-testid"?: string
}

/** The sage "Zobrazit kolekci ↗" link. */
export default function ArrowLink({ className, children, ...props }: ArrowLinkProps) {
  return (
    <LocalizedClientLink
      className={clx(
        "group inline-flex items-center gap-x-1 text-sage-strong transition-colors duration-150 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
        className
      )}
      {...props}
    >
      {children}
      <ArrowUpRightMini
        aria-hidden="true"
        className="transition-transform duration-150 ease-in-out group-hover:rotate-45"
      />
    </LocalizedClientLink>
  )
}
