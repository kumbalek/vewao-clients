import { clx } from "@medusajs/ui"
import React from "react"

import { isPending, type Copy } from "content/site"

/**
 * Marks content the merchant has not supplied yet, or a destination that does
 * not exist yet. Deliberately conspicuous: nothing marked here may ship.
 */
export function Placeholder({
  children,
  className,
  compact = false,
}: {
  children: React.ReactNode
  className?: string
  /** Keeps a real label on one line and moves the "[doplnit]" note into a tooltip (navigation). */
  compact?: boolean
}) {
  return (
    <span
      data-placeholder=""
      title={compact ? "[doplnit] stránka zatím neexistuje" : undefined}
      className={clx(
        "inline-block rounded-sm border border-dashed border-gold bg-cream px-1.5 text-ink-subtle",
        compact && "whitespace-nowrap",
        className
      )}
    >
      {!compact && <span className="text-xs">[doplnit] </span>}
      {children}
    </span>
  )
}

/** Renders real copy as is and pending copy as a Placeholder. */
export function CopyText({ value, className }: { value: Copy; className?: string }) {
  return isPending(value) ? (
    <Placeholder className={className}>{value.pending}</Placeholder>
  ) : (
    <>{value}</>
  )
}
