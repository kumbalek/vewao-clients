import { clx } from "@medusajs/ui"
import React from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { buttonClasses, type ButtonStyleProps } from "./button"

export type ButtonLinkProps = ButtonStyleProps & {
  /** A shop path without the country code, e.g. "/store". */
  href: string
  className?: string
  children: React.ReactNode
  "data-testid"?: string
}

/** Navigation that looks like a button. Use Button for actions. */
export default function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <LocalizedClientLink
      className={clx(buttonClasses({ variant, size, fullWidth }), className)}
      {...props}
    />
  )
}
