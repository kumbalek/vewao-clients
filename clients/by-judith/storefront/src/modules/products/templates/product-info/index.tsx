import { lexicalHasContent } from "@lib/cms/lexical"
import CmsRichText from "@modules/cms/components/cms-rich-text"
import type { ProductTexts } from "@lib/cms/product-texts"

type ProductInfoProps = {
  texts: Pick<ProductTexts, "subtitle" | "description">
}

/**
 * The product's subtitle and description from the CMS. The name sits under
 * the photo, with the price (owner, 2026-11-25).
 */
const ProductInfo = ({ texts }: ProductInfoProps) => {
  const description = lexicalHasContent(texts.description)
  if (!texts.subtitle && !description) return null

  return (
    <div id="product-info" className="flex flex-col gap-y-4">
      {texts.subtitle && (
        <p className="text-ui-fg-base whitespace-pre-line" data-testid="product-subtitle">
          {texts.subtitle}
        </p>
      )}

      {/* Headings stand out from the text (vewao-clients#70): Payload descriptions use h2 and h3. */}
      {description && (
        <div
          className="font-normal font-sans txt-medium text-ui-fg-subtle [&>*+*]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:font-semibold [&_a]:underline [&_img]:rounded-[1.5rem] [&_h2]:!mt-8 [&_h2]:text-xl [&_h2]:leading-snug [&_h2]:text-ui-fg-base [&_h3]:!mt-6 [&_h3]:text-lg [&_h3]:leading-snug [&_h3]:text-ui-fg-base"
          data-testid="product-description"
        >
          <CmsRichText state={texts.description} />
        </div>
      )}
    </div>
  )
}

export default ProductInfo
