import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useTranslations } from "next-intl"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const t = useTranslations("product")

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 mx-auto">
        <div className="flex flex-col justify-center items-center">
          <Heading
            level="h2"
            className="text-3xl leading-10 text-ui-fg-base mb-2"
            data-testid="product-title"
          >
            {product.title}
          </Heading>
        </div>
        <p
          className="text-ui-fg-base whitespace-pre-line"
          data-testid="product-subtitle"
        >
          {product.subtitle}
        </p>

        <Text
          className="text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
