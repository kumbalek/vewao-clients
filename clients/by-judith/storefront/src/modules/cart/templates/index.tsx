import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
// import SignInPrompt from "../components/sign-in-prompt"
// import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import BackButton from "../components/backButton"
import PromotionProgressBar from "../components/promotion-progress"
import type { GiftPackaging } from "@lib/data/gift-packaging"
import type { PromotionTier } from "@lib/util/promotion-progress"
import type { SaleLabel } from "@lib/util/sale-labels"
import ActiveSales from "../components/active-sales"

const CartTemplate = ({
  cart,
  customer,
  promotionTiers = [],
  giftPackaging = null,
  activeSales = [],
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  promotionTiers?: PromotionTier[]
  giftPackaging?: GiftPackaging | null
  /** Labels of the running sales this cart gets (owner, 2026-11-22). */
  activeSales?: SaleLabel[]
}) => {
  return (
    <div className="py-12">
      <div className="content-container" data-testid="cart-container">
        <BackButton />
        {!!cart?.items?.length && promotionTiers.length > 0 && (
          <div className="mb-6 p-4 flex justify-center">
            <PromotionProgressBar cart={cart} tiers={promotionTiers} />
          </div>
        )}
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-32">
            {/* Insert the component here, above the items list */}
            <div className="flex flex-col bg-white py-6 gap-y-6">
              {/* {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )} */}
              <ItemsTemplate cart={cart} />
            </div>
            <div className="relative">
              <div className="flex flex-col gap-y-8 sticky top-12">
                {cart && cart.region && (
                  <>
                    <div className="bg-white py-6">
                      <Summary cart={cart as any} giftPackaging={giftPackaging} />
                    </div>
                    <ActiveSales labels={activeSales} />
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
