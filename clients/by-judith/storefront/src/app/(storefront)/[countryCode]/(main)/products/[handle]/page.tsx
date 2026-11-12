import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
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
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  // Texts from the CMS; a signed CMS preview of this page shows the latest draft.
  const path = `/${params.countryCode}/products/${params.handle}`
  const { texts, docId, grant } = await getProductPageTexts(pricedProduct, path)
  const edit = grant?.mode === "edit"

  return (
    <>
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        texts={texts}
      />
      {grant && docId && (
        <PreviewBar path={path} editHref={`/admin/collections/products/${docId}`} edit={edit} />
      )}
    </>
  )
}
