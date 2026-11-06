import { Heading } from "@medusajs/ui"
import { getTranslations } from "next-intl/server"

import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import About from "@modules/home/components/about"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import Icons from "@modules/home/components/icons"
import Reviews from "@modules/home/components/reviews"

/**
 * The e-shop's front page: the site's home page before the clinic landing,
 * at /shop, and the home page itself while only the e-shop is live (#47).
 */
export default async function ShopFront({ countryCode }: { countryCode: string }) {
  const t = await getTranslations("hero")
  const region = await getRegion(countryCode)
  const { collections } = await listCollections({ fields: "id, handle, title" })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero />
      <Icons />
      <div className="py-12 small:py-24 flex flex-col items-center">
        <Heading level="h2" className="text-2xl small:text-3xl text-ui-fg-base font-normal max-w-3xl pb-8">
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
