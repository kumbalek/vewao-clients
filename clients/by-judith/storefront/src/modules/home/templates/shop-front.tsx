import { listMenuCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import { isShopOnly } from "@lib/site-mode"
import About from "@modules/home/components/about"
import FeaturedProducts from "@modules/home/components/featured-products"
import Reviews from "@modules/home/components/reviews"
import HeroAnimation from "@modules/landing/components/hero-animation"

/**
 * The e-shop's front page: the site's home page before the clinic landing,
 * at /shop, and the home page itself while only the e-shop is live (#47).
 */
export default async function ShopFront({ countryCode }: { countryCode: string }) {
  const region = await getRegion(countryCode)
  const categories = await listMenuCategories().catch(() => [])

  if (!region) {
    return null
  }

  return (
    <>
      {/* The landing's video hero replaces the gradient one (owner, 2026-11-25):
          the claims without links to the clinic's pages while only the e-shop is live. */}
      <HeroAnimation shopOnly={isShopOnly()} />
      {/* The categories' rails, each under its own heading; no overall title (owner, 2026-11-25). */}
      <div className="py-12 small:py-24 flex flex-col items-center">
        <ul className="flex flex-col w-full">
          <FeaturedProducts categories={categories} region={region} />
        </ul>
      </div>
      <Reviews />
      <About />
    </>
  )
}
