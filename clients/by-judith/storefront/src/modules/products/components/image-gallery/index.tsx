import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"

import VoucherImage from "@modules/products/components/voucher-image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  /** The product's name, for the photos' text alternative. */
  title: string
  /** A gift voucher's name: its first image is the empty voucher, shown with the name on it. */
  voucherTitle?: string | null
}

const SIZES = "(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"

const ImageGallery = ({ images, title, voucherTitle }: ImageGalleryProps) => {
  const voucher = voucherTitle && images[0]?.url
  if (voucher) {
    return (
      <Container className="relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle rounded-[3rem] p-[10%]">
        <VoucherImage src={voucher} title={voucherTitle} alt={title} sizes={SIZES} priority />
      </Container>
    )
  }

  return (
    <div className="flex items-start relative">
      <div className="flex flex-col flex-1 gap-y-4">
        {images.map((image, index) => {
          return (
            <Container
              key={image.id}
              className="relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle rounded-[3rem]"
              id={image.id}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  priority={index <= 2 ? true : false}
                  className="absolute inset-0 rounded-[3rem]"
                  alt={images.length > 1 ? `${title} – foto ${index + 1}` : title}
                  fill
                  sizes={SIZES}
                  style={{
                    objectFit: "cover",
                  }}
                />
              )}
            </Container>
          )
        })}
      </div>
    </div>
  )
}

export default ImageGallery
