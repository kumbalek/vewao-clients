import { HttpTypes } from "@medusajs/types"
import {
  promotionProgress,
  type PromotionTier,
} from "@lib/util/promotion-progress"

type PromotionProgressBarProps = {
  cart: HttpTypes.StoreCart
  tiers: PromotionTier[]
}

/**
 * Progress towards the quantity tiers switched on in admin. Shown only while
 * such promotions are active; texts come from each promotion in admin. The
 * discount itself is in the cart totals, computed by the backend.
 */
const PromotionProgressBar = ({ cart, tiers }: PromotionProgressBarProps) => {
  const progress = promotionProgress(tiers, cart.items)
  if (!progress) {
    return null
  }

  return (
    <div className="w-full max-w-4xl py-4" data-testid="promotion-progress">
      <p
        className="text-small-regular text-ui-fg-base text-sm md:text-lg mb-2"
        aria-live="polite"
        data-testid="promotion-progress-text"
      >
        {progress.text}
      </p>
      <div
        role="progressbar"
        aria-label="Postup ke slevě za množství"
        aria-valuemin={0}
        aria-valuemax={progress.steps[progress.steps.length - 1]?.min_count ?? 0}
        aria-valuenow={Math.min(
          progress.count,
          progress.steps[progress.steps.length - 1]?.min_count ?? 0
        )}
        aria-valuetext={progress.text}
        className="relative w-full h-2.5 overflow-hidden rounded-full bg-gray-200"
      >
        <div
          className="h-2.5 rounded-full bg-gold transition-all duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${progress.percent}%` }}
        />
        {progress.steps.slice(0, -1).map((step) => (
          <div
            key={step.code}
            aria-hidden="true"
            className="absolute top-0 h-full w-0.5 bg-white opacity-50"
            style={{ left: `${step.position}%` }}
          />
        ))}
      </div>
      <ol className="relative mt-1 h-4 text-[10px] text-gray-500" aria-hidden="true">
        {progress.steps.map((step) => (
          <li
            key={step.code}
            className={`absolute -translate-x-full whitespace-nowrap ${step.reached ? "font-bold text-black" : ""}`}
            style={{ left: `${step.position}%` }}
          >
            {step.label}
          </li>
        ))}
      </ol>
    </div>
  )
}

export default PromotionProgressBar
