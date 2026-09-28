"use client"

import { clx } from "@medusajs/ui"
import React from "react"

import { useDisclosure } from "../hooks/use-disclosure"

export type HotspotProps = {
  /** Accessible name of the dot, e.g. "№ 1 Allergy – podrobnosti". */
  label: string
  /** Position the hotspot over its image, e.g. "absolute left-[16%] top-[45%]". */
  className?: string
  children: React.ReactNode
}

/**
 * The breathing gold dot that reveals a product card over an image. Opens on
 * mouse hover, on tap, and with Enter/Space; Escape, a tap outside or moving
 * focus away closes it.
 */
export default function Hotspot({ label, className, children }: HotspotProps) {
  const { open, panelId, rootProps, triggerProps } = useDisclosure()

  return (
    <div {...rootProps} className={clx("relative inline-block", className)}>
      <button
        {...triggerProps}
        aria-label={label}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg transition-colors duration-300 hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink small:h-10 small:w-10"
      >
        <span
          aria-hidden="true"
          className={clx(
            "rounded-full bg-gold transition-all duration-300",
            open
              ? "h-4 w-4 small:h-6 small:w-6"
              : "h-3 w-3 motion-safe:animate-breathe small:h-5 small:w-5"
          )}
        />
      </button>
      <div
        id={panelId}
        className={clx(
          "absolute left-0 top-full z-20 mt-2 flex min-w-40 origin-top-left flex-col items-start gap-2 rounded-popover border border-line bg-white px-4 py-3 transition-[opacity,transform,visibility] duration-300 motion-reduce:transition-none",
          open ? "visible scale-100 opacity-100" : "invisible scale-50 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  )
}
