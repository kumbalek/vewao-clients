import { clx } from "@medusajs/ui"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type CategoryBoxSize = "default" | "small"

const sizes = {
  // A top-level category: image, title and subtitle.
  default: { box: "gap-3 rounded-popover p-2 pr-4", image: 56, imageClass: "rounded-chip", title: "text-sm" },
  // A subcategory under its category: smaller, no subtitle.
  small: { box: "gap-2 rounded-chip p-1.5 pr-3", image: 32, imageClass: "rounded-[0.6rem]", title: "text-xs" },
} as const

/**
 * A category in the Shop menus (vewao-clients#70): its image on the left, then
 * its title and, in the default size, its subtitle (the category's
 * description). The image comes from the category's metadata; without one a
 * plain tile keeps the boxes aligned. Light text over a dark hero (`overlay:`).
 */
export default function CategoryBox({
  href,
  title,
  subtitle,
  image,
  size = "default",
  className,
}: {
  href: string
  title: string
  subtitle?: string | null
  image?: string | null
  size?: CategoryBoxSize
  className?: string
}) {
  const s = sizes[size]

  return (
    <LocalizedClientLink
      href={href}
      data-testid="category-box"
      className={clx(
        "flex items-center border border-line bg-white text-ink transition-colors duration-150 hover:bg-surface-hover",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
        "overlay:border-white/20 overlay:bg-white/5 overlay:text-white overlay:hover:bg-white/10 overlay:focus-visible:outline-white",
        s.box,
        className
      )}
    >
      <span
        className={clx("relative shrink-0 overflow-hidden bg-surface overlay:bg-white/10", s.imageClass)}
        style={{ width: s.image, height: s.image }}
      >
        {image && (
          // The URL is the merchant's (category metadata), so any host: shown as is.
          <Image src={image} alt="" fill sizes={`${s.image}px`} unoptimized className="object-cover" />
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={clx("leading-snug", s.title)}>{title}</span>
        {size === "default" && subtitle && (
          <span className="line-clamp-2 text-xs leading-snug text-ink-subtle overlay:text-white/70">{subtitle}</span>
        )}
      </span>
    </LocalizedClientLink>
  )
}
