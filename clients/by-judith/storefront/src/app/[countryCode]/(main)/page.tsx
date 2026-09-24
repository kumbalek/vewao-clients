import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import Reviews from "@modules/home/components/reviews"
import Icons from "@modules/home/components/icons"
import About from "@modules/home/components/about"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { Heading } from "@medusajs/ui"

// import { retrieveCart } from "@lib/data/cart"
// import ValentineDiscountProgress from "@modules/cart/components/valentine-promo-progress"
// import TieredDiscountProgress from "@modules/cart/components/discount-progress"

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const t = await getTranslations("hero")
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  // const cart = await retrieveCart()

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero />
      <Icons />
      <div className="py-12 small:py-24 flex flex-col items-center">
        <Heading
          level="h2"
          className="text-2xl small:text-3xl text-ui-fg-base font-normal max-w-3xl pb-8"
        >
          {t("productsTitle")}
        </Heading>
        <ul className="flex flex-col gap-4 w-full">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
      <Reviews />
      <About />
    </>
  )
}
