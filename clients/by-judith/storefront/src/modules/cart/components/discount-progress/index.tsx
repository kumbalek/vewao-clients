import { HttpTypes } from "@medusajs/types"
import { useMemo } from "react"

// Access the Gift Packaging ID
const GIFT_VARIANT_ID = process.env.NEXT_PUBLIC_GIFT_PACKAGING_VARIANT_ID

type DiscountProgressProps = {
  cart: HttpTypes.StoreCart | null
}

const TieredDiscountProgress = ({ cart }: DiscountProgressProps) => {
  // 1. Calculate Total Items safely (Excluding Gift Packaging)
  const totalItems = useMemo(() => {
    if (!cart || !cart.items) return 0

    return cart.items.reduce((acc, item) => {
      // Logic: If this item is the Gift Packaging, skip it
      if (item.variant_id === GIFT_VARIANT_ID) {
        return acc
      }

      // Add the quantity (wrapped in Number for safety)
      return acc + Number(item.quantity)
    }, 0)
  }, [cart])

  // 2. Define Logic for Messaging and Progress
  const getStatus = () => {
    if (totalItems === 0) {
      return {
        message:
          "Kupte 1 balení a získáte 10 % slevu, 2 balení 20 %, 3+ balení 30 %!",
        nextStep: 1,
        percent: 0,
        currentTier: 0,
      }
    }
    if (totalItems === 1) {
      return {
        message:
          "🎉 Získáváte slevu 10 %! Kupte jakýkoliv další produkt a získáte 20 %.",
        nextStep: 1,
        percent: 33,
        currentTier: 10,
      }
    }
    if (totalItems === 2) {
      return {
        message:
          "🔥 Získáváte slevu 20 %! Kupte jakýkoliv další produkt a získáte 30 %.",
        nextStep: 1,
        percent: 66,
        currentTier: 20,
      }
    }
    return {
      message: "🏆 Získáváte maximální slevu 30 %!",
      nextStep: 0,
      percent: 100,
      currentTier: 30,
    }
  }

  const status = getStatus()

  return (
    <div className="w-full py-4 max-w-4xl">
      <p className="text-small-regular text-ui-fg-base text-sm md:text-lg mb-2">
        {status.message}
      </p>

      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 relative overflow-hidden">
        <div
          className="bg-gold h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${status.percent}%` }}
        ></div>

        <div className="absolute top-0 left-[33%] h-full w-0.5 bg-white opacity-50"></div>
        <div className="absolute top-0 left-[66%] h-full w-0.5 bg-white opacity-50"></div>
      </div>

      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
        <span>Start</span>
        <span className={totalItems >= 1 ? "font-bold text-black" : ""}>
          10 %
        </span>
        <span className={totalItems >= 2 ? "font-bold text-black" : ""}>
          20 %
        </span>
        <span className={totalItems >= 3 ? "font-bold text-black" : ""}>
          30 %
        </span>
      </div>
    </div>
  )
}

export default TieredDiscountProgress
