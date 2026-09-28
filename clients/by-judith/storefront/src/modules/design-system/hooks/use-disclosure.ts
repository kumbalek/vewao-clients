"use client"

import React, { useEffect, useId, useRef, useState } from "react"

/**
 * Open/close behaviour shared by hover panels (hotspot, header menus). Opens on
 * mouse hover, on tap and with Enter/Space on the trigger; Escape, a press
 * outside or moving focus away closes it.
 */
export function useDisclosure() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const lastPointer = useRef("")
  const panelId = useId()

  useEffect(() => {
    if (!open) return

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", closeOnOutsidePress)
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress)
  }, [open])

  const rootProps = {
    ref: rootRef,
    onPointerEnter: (event: React.PointerEvent) => {
      if (event.pointerType === "mouse") setOpen(true)
    },
    onPointerLeave: (event: React.PointerEvent) => {
      if (event.pointerType === "mouse") setOpen(false)
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false)
        triggerRef.current?.focus()
      }
    },
    onBlur: (event: React.FocusEvent) => {
      if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
        setOpen(false)
      }
    },
  }

  const triggerProps = {
    ref: triggerRef,
    type: "button" as const,
    "aria-expanded": open,
    "aria-controls": panelId,
    onPointerDown: (event: React.PointerEvent) => {
      lastPointer.current = event.pointerType
    },
    onClick: () => {
      // Hover already opened it for a mouse; a click must not close it again.
      if (lastPointer.current === "mouse") setOpen(true)
      else setOpen((value) => !value)
      lastPointer.current = ""
    },
  }

  return { open, setOpen, panelId, rootProps, triggerProps }
}
