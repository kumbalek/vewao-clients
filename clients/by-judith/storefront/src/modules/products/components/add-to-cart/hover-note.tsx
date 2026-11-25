"use client"

import { clx } from "@medusajs/ui"
import { useEffect, useId, useState, type ReactNode } from "react"

/**
 * A short note above a card's button, shown on hover or focus (vewao-clients#75):
 * "more variants" on the "i", "not in stock" on a product that cannot be added.
 * Escape hides it without moving away, and the pointer can move onto it
 * (WCAG 1.4.13). `children` gets the note's id for `aria-describedby`.
 */
export default function HoverNote({
  note,
  children,
  className,
  "data-testid": testId,
}: {
  note: string
  children: (noteId: string) => ReactNode
  className?: string
  "data-testid"?: string
}) {
  const noteId = useId()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // A hovered note has no focus inside, so Escape is heard on the document. With
  // focus inside, onKeyDown below hears it at once, before this effect has run.
  useEffect(() => {
    if (!hovered) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDismissed(true)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [hovered])

  return (
    <div
      className={clx("group/note relative", className)}
      onMouseEnter={() => setHovered(true)}
      // Once neither hovered nor focused, the next hover or focus shows the note again.
      onMouseLeave={() => {
        setHovered(false)
        if (!focused) setDismissed(false)
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false)
        if (!hovered) setDismissed(false)
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setDismissed(true)
      }}
      data-testid={testId}
    >
      {children(noteId)}
      {/* The bottom padding bridges the gap, so the pointer can move onto the note. */}
      <div
        className={clx(
          "invisible absolute bottom-full right-0 z-20 pb-2 opacity-0 transition-[opacity,visibility] duration-200 motion-reduce:transition-none",
          !dismissed && "group-hover/note:visible group-hover/note:opacity-100 group-focus-within/note:visible group-focus-within/note:opacity-100"
        )}
      >
        <div
          id={noteId}
          role="tooltip"
          className="w-max max-w-[14rem] rounded-chip bg-ink px-3 py-2 text-left text-xs leading-snug text-white shadow-lg"
        >
          {note}
        </div>
      </div>
    </div>
  )
}
