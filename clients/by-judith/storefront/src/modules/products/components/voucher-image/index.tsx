import { clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import Image from "next/image"
import React from "react"

// The empty voucher (owner's vouhcer.png, A5 landscape, 2480 × 1748): the free
// area right of the baubles and under the logo, as fractions of the card.
const CARD_RATIO = "2480 / 1748"
const TEXT_AREA: React.CSSProperties = { left: "37%", right: "8%", top: "29%", bottom: "15%" }

// After the owner's A4 mockup (bbclinic mockup-a4.jpg, 2026-11-22): the card
// lies on a table, seen from above at an angle. The table is the site's light
// sand (tokens sand.light), lighter than the mockup's beige (owner).
const TABLE = "radial-gradient(120% 100% at 78% 18%, #FDFAF5 0%, #F7F0E4 55%, #EFE5D3 100%)"
// The card turned in its plane, then the table tipped away from the viewer (its
// far edge shorter). The perspective is in card widths (container units), so
// the depth looks the same from the cart thumbnail to the product page.
const TILT = "perspective(350cqw) rotateX(40deg) rotateY(-6deg) rotateZ(-18deg)"
// Around the card's own outline, after the tilt: a contact shadow and a soft one.
const SHADOW = "drop-shadow(0 3px 4px rgb(90 70 40 / 0.13)) drop-shadow(0 22px 28px rgb(90 70 40 / 0.15))"
// Light falling from the top right across the paper.
const LIGHT = "linear-gradient(120deg, rgb(255 255 255 / 0) 35%, rgb(60 40 20 / 0.07) 100%)"

/**
 * A gift voucher's picture (vewao-clients#70): the empty voucher image with
 * the product's name written in its free area, lying on a table in
 * perspective with a shadow, like a photographed print. It fills its
 * positioned parent. The text scales with the card (container units), so it
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
      className={clx("absolute inset-0 flex items-center justify-center p-[11%]", className)}
      style={{ background: TABLE }}
    >
      <div className="w-full" style={{ filter: SHADOW, containerType: "inline-size" }}>
        <div className="relative w-full" style={{ aspectRatio: CARD_RATIO, transform: TILT, containerType: "inline-size" }}>
          <Image src={src} alt="" fill sizes={sizes} priority={priority} className="object-contain" draggable={false} />
          <div className="absolute inset-0" style={{ background: LIGHT }} />
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
