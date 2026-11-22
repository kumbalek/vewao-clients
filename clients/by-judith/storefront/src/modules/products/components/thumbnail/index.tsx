import { Container, clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"
import VoucherImage from "@modules/products/components/voucher-image"

type ThumbnailProps = {
  thumbnail?: string | null
  // TODO: Fix image typings
  images?: any[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
  /**
   * Text alternative. Empty by default: product thumbnails sit next to the
   * product's name, so they are decorative. Give other images a description.
   */
  alt?: string
  /** A gift voucher's name: the image is the empty voucher, shown with the name on it. */
  voucherTitle?: string | null
}

const SIZES = "(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  "data-testid": dataTestid,
  alt = "",
  voucherTitle,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden p-4 bg-ui-bg-subtle shadow-elevation-card-rest rounded-[3rem] group-hover:shadow-elevation-card-hover transition-shadow ease-in-out duration-150 m-px",
        className,
        {
          "aspect-[11/14]": size !== "square",
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      {initialImage && voucherTitle ? (
        <div className="absolute inset-0 p-[9%]">
          <VoucherImage src={initialImage} title={voucherTitle} alt={alt} sizes={SIZES} />
        </div>
      ) : (
        <ImageOrPlaceholder image={initialImage} size={size} alt={alt} />
      )}
    </Container>
  )
}

const ImageOrPlaceholder = ({
  image,
  size,
  alt,
}: Pick<ThumbnailProps, "size"> & { image?: string; alt: string }) => {
  return image ? (
    <Image
      src={image}
      alt={alt}
      className="absolute inset-0 object-cover object-center"
      draggable={false}
      quality={50}
      sizes={SIZES}
      fill
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex items-center justify-center">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
