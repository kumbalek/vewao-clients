import { HttpTypes } from "@medusajs/types"
import { useMemo } from "react"

//  Access the Gift Packaging ID (to exclude from count if necessary)
const GIFT_VARIANT_ID = process.env.NEXT_PUBLIC_GIFT_PACKAGING_VARIANT_ID

type PromoProgressProps = {
  cart: HttpTypes.StoreCart | null
}

const ValentinePromoProgress = ({ cart }: PromoProgressProps) => {
  // 1. Calculate Eligible Items (Excluding Gift Packaging)
  const eligibleItemsCount = useMemo(() => {
    if (!cart || !cart.items) return 0

    return cart.items.reduce((acc, item) => {
      // Exclude specific variants like Gift Packaging if needed
      if (item.variant_id === GIFT_VARIANT_ID) {
        return acc
      }

      // Also exclude "Dárkové balení" if filtered by product title/handle
      // (Optional: Add extra checks here if GIFT_VARIANT_ID isn't enough)

      return acc + Number(item.quantity)
    }, 0)
  }, [cart])

  // 2. Define Logic for the 3-Step Journey
  const getStatus = () => {
    if (eligibleItemsCount === 0) {
      return {
        message: "Kupte 3 produkty a jeden máte zdarma!",
        percent: 0,
        isComplete: false,
      }
    }
    if (eligibleItemsCount === 1) {
      return {
        message: "Máte 1 produkt. Přidejte ještě 2 a jeden získáte zdarma!",
        percent: 33,
        isComplete: false,
      }
    }
    if (eligibleItemsCount === 2) {
      return {
        message: "🔥 Už jen kousek! Přidejte 1 produkt zdarma.",
        percent: 66,
        isComplete: false,
      }
    }
    // 3 or more items
    return {
      message: "💘 Gratulujeme! Jedno balení máte zdarma.",
      percent: 100,
      isComplete: true,
    }
  }

  const status = getStatus()

  return (
    <div className="w-full py-4 max-w-4xl">
      <p className="text-small-regular text-ui-fg-base text-sm md:text-lg mb-2">
        {status.message}
      </p>

      {/* Progress Bar Container */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 relative overflow-hidden">
        {/* Fill Bar */}
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ease-out bg-gold`}
          style={{ width: `${status.percent}%` }}
        ></div>

        {/* Vertical Dividers for 1/3 and 2/3 */}
        <div className="absolute top-0 left-[33%] h-full w-0.5 bg-white opacity-50"></div>
        <div className="absolute top-0 left-[66%] h-full w-0.5 bg-white opacity-50"></div>
      </div>

      {/* Labels below the bar */}
      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
        <span></span>
        <span className={eligibleItemsCount >= 1 ? "font-bold text-black" : ""}>
          1 ks
        </span>
        <span className={eligibleItemsCount >= 2 ? "font-bold text-black" : ""}>
          2 ks
        </span>
        <span className={eligibleItemsCount >= 3 ? "font-bold text-black" : ""}>
          3 ks (1 zdarma)
        </span>
      </div>
    </div>
  )
}

export default ValentinePromoProgress
