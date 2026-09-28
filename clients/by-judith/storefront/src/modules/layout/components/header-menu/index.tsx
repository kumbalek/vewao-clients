"use client"

import { clx } from "@medusajs/ui"
import React from "react"

import { ChevronIcon } from "@modules/design-system/components/icons"
import { useDisclosure } from "@modules/design-system/hooks/use-disclosure"

/**
 * A top-level header item with a full-width panel ("mega menu"). Opens on hover
 * or focus-and-Enter; the panel is positioned against the sticky header, so the
 * item itself stays static.
 */
export default function HeaderMenu({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const { open, setOpen, panelId, rootProps, triggerProps } = useDisclosure()

  return (
    <div {...rootProps} className="flex h-full items-center">
      <button
        {...triggerProps}
        className="flex items-center gap-1 text-sm text-ink transition-colors duration-150 hover:text-ink-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        {label}
        <ChevronIcon
          size={14}
          className={clx("transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      <div
        id={panelId}
        onClick={(event) => {
          if ((event.target as Element).closest("a")) setOpen(false)
        }}
        className={clx(
          "absolute inset-x-0 top-full border-y border-line bg-white transition-[opacity,visibility] duration-200 motion-reduce:transition-none",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  )
}
