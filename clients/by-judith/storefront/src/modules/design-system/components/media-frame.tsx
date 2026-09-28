import { clx } from "@medusajs/ui"
import React from "react"

export type MediaRatio = "portrait" | "product" | "square" | "landscape"

const ratios: Record<MediaRatio, string> = {
  // Product cards and rails
  portrait: "aspect-[11/14]",
  // Product page gallery
  product: "aspect-[29/34]",
  square: "aspect-square",
  // Magazine cards and editorial images
  landscape: "aspect-[4/3]",
}

export type MediaFrameProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Omit to let the content set the height, e.g. an image with auto height. */
  ratio?: MediaRatio
}

/**
 * The rounded, clipped frame around product and editorial images. Fill it with
 * `<Image fill className="object-cover" />` when a ratio is set.
 */
export default function MediaFrame({ ratio, className, ...props }: MediaFrameProps) {
  return (
    <div
      className={clx(
        "relative w-full overflow-hidden rounded-card bg-surface",
        ratio && ratios[ratio],
        className
      )}
      {...props}
    />
  )
}
