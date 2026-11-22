"use client"

import { clx } from "@medusajs/ui"
import React from "react"

import { useDisclosure } from "../hooks/use-disclosure"

export type InfoTipProps = {
  /** Accessible name of the "i" button, e.g. "Informace o ceně". */
  label: string
  className?: string
  /** The explanation; also the button's accessible description. */
  children: React.ReactNode
}

/**
 * A small "i" that explains something next to it, e.g. the 30-day lowest
 * price behind a struck-through price (vewao-clients#70). Opens on mouse
 * hover, on tap and with Enter/Space; Escape, a press outside or moving focus
 * away closes it. Screen readers get the text as the button's description.
 */
export default function InfoTip({ label, className, children }: InfoTipProps) {
  const { open, panelId, rootProps, triggerProps } = useDisclosure()

  return (
    <div {...rootProps} className={clx("relative inline-flex", className)}>
      <button
        {...triggerProps}
        aria-label={label}
        aria-describedby={panelId}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-line text-[0.7rem] italic leading-none text-ink-subtle transition-colors duration-150 hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <span aria-hidden="true">i</span>
      </button>
      <div
        id={panelId}
        role="tooltip"
        className={clx(
          // Below the "i": above it, it would cover what it explains (the new price).
          "absolute top-full left-1/2 z-20 mt-2 w-max max-w-[16rem] -translate-x-1/2 rounded-chip bg-ink px-3 py-2 text-left text-xs leading-snug text-white shadow-lg transition-[opacity,visibility] duration-200 motion-reduce:transition-none",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  )
}
