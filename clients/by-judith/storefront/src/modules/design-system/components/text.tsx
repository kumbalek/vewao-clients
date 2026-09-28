import { clx } from "@medusajs/ui"
import React from "react"

export type TextSize = "lead" | "base" | "sm" | "xs"
export type TextTone = "default" | "subtle" | "muted" | "inverse"

const sizes: Record<TextSize, string> = {
  // Testimonials and introductions
  lead: "text-lg tracking-wide",
  base: "text-base",
  // Product descriptions and dense copy
  sm: "text-sm leading-relaxed",
  // Captions, navigation, subtitles
  xs: "text-xs",
}

const tones: Record<TextTone, string> = {
  default: "text-ink",
  subtle: "text-ink-subtle",
  muted: "text-ink-muted",
  inverse: "text-white",
}

export type TextProps = React.HTMLAttributes<HTMLElement> & {
  as?: "p" | "span" | "div"
  size?: TextSize
  tone?: TextTone
}

export default function Text({
  as: Tag = "p",
  size = "base",
  tone = "default",
  className,
  ...props
}: TextProps) {
  return (
    <Tag
      className={clx("font-sans font-normal", sizes[size], tones[tone], className)}
      {...props}
    />
  )
}
