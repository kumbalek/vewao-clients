import { clx } from "@medusajs/ui"
import React from "react"

export type CardTone = "surface" | "outline" | "dark" | "glow"
export type CardPadding = "none" | "md"

const tones: Record<CardTone, string> = {
  // "Judita Halvová" and review panels
  surface: "bg-surface text-ink",
  outline: "bg-white text-ink border border-line",
  // Free-delivery popup
  dark: "bg-black text-white",
  // The warm hero glow, as a static gradient
  glow: "bg-gradient-to-br from-sand-light to-sand text-ink",
}

const paddings: Record<CardPadding, string> = {
  none: "",
  md: "p-6 small:p-8",
}

export type CardProps = React.HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article" | "aside"
  tone?: CardTone
  padding?: CardPadding
}

/** The rounded panel that carries most of the site's content blocks. */
export default function Card({
  as: Tag = "div",
  tone = "surface",
  padding = "md",
  className,
  ...props
}: CardProps) {
  return (
    <Tag
      className={clx("rounded-card", tones[tone], paddings[padding], className)}
      {...props}
    />
  )
}
