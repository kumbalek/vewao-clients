import { clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import Image from "next/image"
import React from "react"

// The empty voucher (owner's vouhcer.png, A5 landscape, 2480 × 1748): the free
// area right of the baubles and under the logo, as fractions of the card.
const CARD_RATIO = "2480 / 1748"
const TEXT_AREA: React.CSSProperties = { left: "37%", right: "8%", top: "29%", bottom: "15%" }

// A printed card turned towards the viewer: mostly around its vertical axis,
// so its left edge is nearer, a little around Z, hardly around X (owner, 2026-11-22).
const TILT = "perspective(1000px) rotateX(2deg) rotateY(-20deg) rotate(-5deg)"
// Drawn around the card's own outline, after the tilt: a contact shadow and a soft one.
const SHADOW = "drop-shadow(0 2px 3px rgb(64 44 20 / 0.14)) drop-shadow(0 16px 24px rgb(64 44 20 / 0.18))"

/**
 * A gift voucher's picture (vewao-clients#70): the empty voucher image with
 * the product's name written in its free area, tilted a little with a shadow,
 * like a printed card. The text scales with the card (container units), so it
 * sits right at any size, from the cart thumbnail to the product page.
 *
 * Decorative by default (the name is shown beside it); give `alt` where the
 * picture stands alone.
 */
export default function VoucherImage({
  src,
  title,
  alt = "",
  sizes,
  priority,
  className,
}: {
  src: string
  title: string
  alt?: string
  sizes: string
  priority?: boolean
  className?: string
}) {
  const t = useTranslations("product")

  return (
    <div
      {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
      data-testid="voucher-image"
      className={clx("flex h-full w-full items-center justify-center", className)}
    >
      <div className="w-full" style={{ filter: SHADOW }}>
        <div className="relative w-full" style={{ aspectRatio: CARD_RATIO, transform: TILT, containerType: "inline-size" }}>
          <Image src={src} alt="" fill sizes={sizes} priority={priority} className="object-contain" draggable={false} />
          <div className="absolute flex flex-col items-center justify-center gap-[1.4cqw] text-center" style={TEXT_AREA}>
            <span className="uppercase tracking-[0.18em] text-ink-muted" style={{ fontSize: "2.3cqw" }}>
              {t("voucher")}
            </span>
            <span
              data-testid="voucher-title"
              className="line-clamp-4 text-balance leading-[1.15] text-ink"
              style={{ fontSize: "4.4cqw" }}
            >
              {title}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
