import { clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type CategoryBoxSize = "default" | "small"

const sizes = {
  // A top-level category: image, title at the top, subtitle under it. Titles
  // are 10 % above text-sm and text-xs (owner, 2026-11-22).
  default: {
    tile: "rounded-popover",
    link: "items-start gap-3 p-2 pr-4",
    image: 56,
    imageClass: "rounded-chip",
    text: "pt-0.5",
    title: "text-[0.9625rem]",
  },
  // A subcategory under its category: smaller, no subtitle, title centred.
  small: {
    tile: "rounded-chip",
    link: "items-center gap-2 p-1.5 pr-3",
    image: 32,
    imageClass: "rounded-[0.6rem]",
    text: "",
    title: "text-[0.825rem]",
  },
} as const

/**
 * A category in the Shop menus (vewao-clients#70): its image on the left, then
 * its title at the top and, in the default size, its subtitle (the category's
 * description) under it; the small size centres its title. A rounded tile on
 * the site's surface colour, without a border. The image comes from the
 * category's metadata; without one a plain tile keeps the boxes aligned. Light
 * text over a dark hero (`overlay:`).
 *
 * `action` sits inside the tile after the link, e.g. the mobile menu's arrow
 * that opens the subcategories: a button cannot be nested in a link, and every
 * box keeps the same width.
 */
export default function CategoryBox({
  href,
  title,
  subtitle,
  image,
  size = "default",
  active = false,
  action,
  className,
}: {
  href: string
  title: string
  subtitle?: string | null
  image?: string | null
  size?: CategoryBoxSize
  /** Its subcategories are showing: keep the hover colour. */
  active?: boolean
  action?: React.ReactNode
  className?: string
}) {
  const s = sizes[size]

  return (
    <div
      data-testid="category-box"
      className={clx(
        "flex text-ink transition-colors duration-150 hover:bg-surface-hover",
        active ? "bg-surface-hover overlay:bg-white/10" : "bg-surface overlay:bg-white/5",
        "overlay:text-white overlay:hover:bg-white/10",
        s.tile,
        className
      )}
    >
      <LocalizedClientLink
        href={href}
        className={clx(
          "flex min-w-0 flex-1 rounded-[inherit]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink overlay:focus-visible:outline-white",
          s.link,
          Boolean(action) && "pr-1"
        )}
      >
        <span
          className={clx("relative shrink-0 overflow-hidden bg-white overlay:bg-white/10", s.imageClass)}
          style={{ width: s.image, height: s.image }}
        >
          {image && (
            // The URL is the merchant's (category metadata), so any host: shown as is.
            <Image src={image} alt="" fill sizes={`${s.image}px`} unoptimized className="object-cover" />
          )}
        </span>
        <span className={clx("flex min-w-0 flex-col gap-0.5", s.text)}>
          <span className={clx("leading-snug", s.title)}>{title}</span>
          {size === "default" && subtitle && (
            <span className="line-clamp-2 text-xs leading-snug text-ink-subtle overlay:text-white/70">{subtitle}</span>
          )}
        </span>
      </LocalizedClientLink>
      {Boolean(action) && <div className="flex shrink-0 items-center pr-2">{action}</div>}
    </div>
  )
}
