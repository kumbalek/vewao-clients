import { listMenuCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import About from "@modules/home/components/about"
import FeaturedProducts from "@modules/home/components/featured-products"
import Reviews from "@modules/home/components/reviews"
import DiamondHero from "@modules/home/components/diamond-hero"
import SaleShowcase from "@modules/home/components/sale-showcase"
import ShopHero from "@modules/home/components/shop-hero"

/**
 * The e-shop's front page: the site's home page before the clinic landing,
 * at /shop, and the home page itself while only the e-shop is live (#47).
 */
export default async function ShopFront({
  countryCode,
  hero = "diamond",
}: {
  countryCode: string
  /** Prototypes to compare (owner, 2026-11-25): the WebGL diamond, or `?hero=video`. */
  hero?: "diamond" | "video"
}) {
  const region = await getRegion(countryCode)
  const categories = await listMenuCategories().catch(() => [])

  if (!region) {
    return null
  }

  return (
    <>
      {/* A compact video hero, then the offers, so the call to action and
          "Akce" come within the first screen (owner, 2026-11-25). The
          scrollytelling hero stays on the clinic's landing page. */}
      {hero === "video" ? <ShopHero /> : <DiamondHero />}
      <SaleShowcase countryCode={countryCode} region={region} />
      {/* The categories' rails, each under its own heading; no overall title (owner, 2026-11-25). */}
      <div id="produkty" className="scroll-mt-24 py-12 small:py-24 flex flex-col items-center">
        <ul className="flex flex-col w-full">
          <FeaturedProducts categories={categories} region={region} />
        </ul>
      </div>
      <Reviews />
      <About />
    </>
  )
}
