import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { PRODUCT_LIST_FIELDS } from "@lib/util/product-fields"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { listProductTiers } from "@lib/data/promotion-tiers"
import { listRunningSaleLabels } from "@lib/data/sale-labels"
import { saleLabelsForCategories } from "@lib/util/sale-labels"
import { staticVariants, staticVariantsConfig } from "@lib/util/static-variants"
import { GIFT_PACKAGING_HANDLE } from "@lib/util/gift-packaging"
import { getProductPageTexts } from "@lib/data/product-texts"
import PreviewBar from "@modules/cms/components/preview-bar"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

// Resolve catalogue routes on demand; building the app does not require a live backend.
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (params.handle === GIFT_PACKAGING_HANDLE) {
    notFound()
  }

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | JuditH`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | JuditH`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    // The categories, with their parent, make the breadcrumb.
    queryParams: { handle: params.handle, fields: `${PRODUCT_LIST_FIELDS},*categories,*categories.parent_category` },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  // Texts from the CMS; a signed CMS preview of this page shows the latest draft.
  const path = `/${params.countryCode}/products/${params.handle}`
  const { texts, docId, grant } = await getProductPageTexts(pricedProduct, path)
  // Volume discounts on this product, e.g. the Christmas sale on Ultherapy's areas (vewao-clients#70).
  const [productTiers, sales] = await Promise.all([listProductTiers(pricedProduct.id), listRunningSaleLabels()])
  // Labels of the running sales on this product's categories (owner, 2026-11-22).
  const saleLabels = saleLabelsForCategories(sales.labels, pricedProduct.categories ?? [])
  // Static variants: another product's option pills, the bundled ones lit (owner, 2026-11-22).
  const staticConfig = staticVariantsConfig(pricedProduct.metadata)
  const staticPills = staticConfig
    ? await listProducts({ countryCode: params.countryCode, queryParams: { handle: staticConfig.from } })
        .then(({ response }) => staticVariants(response.products[0], staticConfig.included))
        .catch(() => null)
    : null
  const edit = grant?.mode === "edit"

  return (
    <>
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        texts={texts}
        productTiers={productTiers}
        staticVariants={staticPills}
        saleLabels={saleLabels}
      />
      {grant && docId && (
        <PreviewBar path={path} editHref={`/admin/collections/products/${docId}`} edit={edit} />
      )}
    </>
  )
}
