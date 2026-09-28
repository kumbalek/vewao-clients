import { clx } from "@medusajs/ui"
import React from "react"

export type ContainerWidth = "page" | "content" | "text"
export type SectionSpacing = "none" | "md" | "lg"

const widths: Record<ContainerWidth, string> = {
  // Navigation, footer and full-bleed rails
  page: "max-w-[1440px]",
  // Most content sections
  content: "max-w-7xl",
  // Centred headings and reading columns
  text: "max-w-3xl",
}

const spacings: Record<SectionSpacing, string> = {
  none: "",
  md: "py-8 small:py-12",
  lg: "py-12 small:py-24",
}

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  width?: ContainerWidth
}

/** Centred column with the site's 24px side gutter. */
export function Container({
  width = "content",
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={clx("mx-auto w-full px-6", widths[width], className)}
      {...props}
    />
  )
}

export type SectionProps = React.HTMLAttributes<HTMLElement> & {
  spacing?: SectionSpacing
  width?: ContainerWidth
}

/** A page band: vertical rhythm plus a container. */
export default function Section({
  spacing = "lg",
  width = "content",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={clx(spacings[spacing], className)} {...props}>
      <Container width={width}>{children}</Container>
    </section>
  )
}
