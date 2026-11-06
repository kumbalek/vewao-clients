import { Metadata } from "next"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { listProcedureMenu } from "@lib/data/procedures"
import { listCollections } from "@lib/data/collections"
import { retrieveCustomer } from "@lib/data/customer"
import { listRegions } from "@lib/data/regions"
import { isShopOnly } from "@lib/site-mode"
import { regionOptions } from "@lib/util/region-options"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import { deliveryCountries } from "content/site"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import SiteFooter from "@modules/layout/templates/site-footer"
import SiteHeader from "@modules/layout/templates/site-header"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()

    shippingOptions = shipping_options
  }

  // Navigation must not take a page down with it; without collections the
  // menus still offer the full product list.
  const { collections } = await listCollections({ fields: "id,handle,title" }).catch(
    () => ({ collections: [] })
  )
  const menuCollections = collections.map(({ id, handle, title }) => ({ id, handle, title }))
  // While only the e-shop is live (#47), the clinic's menu is not shown or read.
  const shopOnly = isShopOnly()
  const procedureMenu = shopOnly ? [] : await listProcedureMenu().catch(() => [])
  // Each delivery country is a region with its own currency (#45).
  const regions = (await listRegions().catch(() => null)) ?? []
  const region = regions.find((r) => r.countries?.some((c) => c?.iso_2 === countryCode))
  const currencyCode = region?.currency_code ?? cart?.currency_code ?? "czk"

  return (
    <>
      <SiteHeader
        countryCode={countryCode}
        currencyCode={currencyCode}
        regionOptions={regionOptions(regions, deliveryCountries)}
        cart={cart}
        collections={menuCollections}
        procedureMenu={procedureMenu}
        shopOnly={shopOnly}
      />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}
      <main id="main">{props.children}</main>
      <SiteFooter collections={menuCollections} shopOnly={shopOnly} />
    </>
  )
}
