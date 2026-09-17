import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
// import ValentineDiscountProgress from "../components/valentine-promo-progress"
// import TieredDiscountProgress from "../components/discount-progress"
// import SignInPrompt from "../components/sign-in-prompt"
// import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import BackButton from "../components/backButton"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="py-12">
      <div className="content-container" data-testid="cart-container">
        <BackButton />
        {/* {!!cart?.items?.length && (
          <div className="mb-6 p-4 flex justify-center">
            <ValentineDiscountProgress cart={cart} />
          </div>
        )} */}
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
                      <Summary cart={cart as any} />
                    </div>
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
