import { clx } from "@medusajs/ui"
import React from "react"

export type HeadingSize = "display" | "xl" | "lg" | "md" | "sm"
export type HeadingTone = "default" | "inverse"

// The site sets every heading in quiche-sans at regular weight.
const sizes: Record<HeadingSize, string> = {
  // Hero claim: "Objevte moudrost mistrů…"
  display:
    "text-2xl small:text-4xl small:leading-10 large:text-5xl large:leading-[3.5rem]",
  // Statement names on content cards: "Judita Halvová"
  xl: "text-4xl small:text-6xl",
  // Section and page titles: "Naše produkty", product name
  lg: "text-2xl small:text-3xl small:leading-10",
  // Card titles and lead-in headings: "Řekla o nás", collection names
  md: "text-xl",
  // Compact titles inside cards and popovers
  sm: "text-base",
}

const tones: Record<HeadingTone, string> = {
  default: "text-ink",
  // On dark cards and photos
  inverse: "text-white",
}

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  /** Document outline level. Choose it independently of the visual size. */
  level?: 1 | 2 | 3 | 4
  size?: HeadingSize
  tone?: HeadingTone
}

export default function Heading({
  level = 2,
  size = "lg",
  tone = "default",
  className,
  ...props
}: HeadingProps) {
  const Tag = `h${level}` as const

  return (
    <Tag
      className={clx("font-sans font-normal", sizes[size], tones[tone], className)}
      {...props}
    />
  )
}
