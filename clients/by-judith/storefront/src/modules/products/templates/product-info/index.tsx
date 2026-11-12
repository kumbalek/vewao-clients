import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import { lexicalHasContent } from "@lib/cms/lexical"
import CmsRichText from "@modules/cms/components/cms-rich-text"
import type { ProductTexts } from "@lib/cms/product-texts"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
  texts: Pick<ProductTexts, "subtitle" | "description">
}

/** The product's name from Medusa; its subtitle and description from the CMS. */
const ProductInfo = ({ product, texts }: ProductInfoProps) => {
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
        {texts.subtitle && (
          <p
            className="text-ui-fg-base whitespace-pre-line"
            data-testid="product-subtitle"
          >
            {texts.subtitle}
          </p>
        )}

        {lexicalHasContent(texts.description) && (
          <div
            className="font-normal font-sans txt-medium text-ui-fg-subtle [&>*+*]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:font-semibold [&_a]:underline [&_img]:rounded-[1.5rem]"
            data-testid="product-description"
          >
            <CmsRichText state={texts.description} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
