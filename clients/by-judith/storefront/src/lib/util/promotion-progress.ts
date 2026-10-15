export type PromotionTier = {
  code: string
  min_count: number
  type: "percentage" | "fixed"
  value: number
  currency_code: string | null
  message: string | null
  teaser: string | null
}

export type CountableLine = { quantity?: number | null; is_discountable?: boolean | null }

export type ProgressStep = {
  code: string
  /** formatTierValue(tier) */
  label: string
  min_count: number
  /** Percent 0..100 along the bar: min_count / last tier's min_count * 100. */
  position: number
  /** count >= min_count */
  reached: boolean
}

export type PromotionProgress = {
  count: number
  /** Highest tier with min_count <= count. */
  current: PromotionTier | null
  /** Lowest tier with min_count > count. */
  next: PromotionTier | null
  /** next ? next.min_count - count : 0 */
  remaining: number
  /** min(count / last.min_count, 1) * 100, rounded to 2 decimals. */
  percent: number
  steps: ProgressStep[]
  text: string
}

/** Round to 2 decimals. */
function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Sum of quantities of lines that promotions may discount
 * (is_discountable !== false; ignore non-finite or <= 0 quantities).
 */
export function discountableItemCount(
  lines: ReadonlyArray<CountableLine | null | undefined> | null | undefined
): number {
  let count = 0
  for (const line of lines ?? []) {
    if (!line || line.is_discountable === false) continue
    const quantity = line.quantity
    if (typeof quantity === "number" && Number.isFinite(quantity) && quantity > 0) {
      count += quantity
    }
  }
  return count
}

/**
 * "10 %" for percentage (value as given, no trailing .00, Czech decimal
 * comma); fixed → Czech currency format of the tier's currency.
 */
export function formatTierValue(tier: PromotionTier): string {
  if (tier.type === "percentage") {
    return `${String(tier.value).replace(".", ",")} %`
  }
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: (tier.currency_code ?? "czk").toUpperCase(),
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(tier.value)
}

/** Replace every {remaining} and {value} placeholder in an editors' text. */
function fill(text: string, remaining: number, value: string): string {
  return text.replaceAll("{remaining}", String(remaining)).replaceAll("{value}", value)
}

/**
 * Progress for the cart, or null when there are no tiers. Medusa applies the
 * discount itself; this only describes progress for the cart UI.
 */
export function promotionProgress(
  tiers: ReadonlyArray<PromotionTier> | null | undefined,
  lines: ReadonlyArray<CountableLine | null | undefined> | null | undefined
): PromotionProgress | null {
  if (!tiers || tiers.length === 0) return null

  const count = discountableItemCount(lines)
  // Assume sorted input, but order by min_count anyway so current/next/steps
  // stay correct if it is not.
  const sorted = [...tiers].sort((a, b) => a.min_count - b.min_count)
  const lastMin = sorted[sorted.length - 1].min_count

  let current: PromotionTier | null = null
  let next: PromotionTier | null = null
  for (const tier of sorted) {
    if (tier.min_count <= count) current = tier
    else if (!next) next = tier
  }

  const remaining = next ? next.min_count - count : 0
  const steps: ProgressStep[] = sorted.map((tier) => ({
    code: tier.code,
    label: formatTierValue(tier),
    min_count: tier.min_count,
    position: round2((tier.min_count / lastMin) * 100),
    reached: count >= tier.min_count,
  }))

  const reachedPart = current
    ? current.message ?? `Získáváte slevu ${formatTierValue(current)}!`
    : null
  const nextPart = next
    ? fill(
        next.teaser ?? `Přidejte ještě {remaining} ks a získáte slevu {value}.`,
        remaining,
        formatTierValue(next)
      )
    : null
  const text = [reachedPart, nextPart].filter((part) => part !== null).join(" ")

  return {
    count,
    current,
    next,
    remaining,
    percent: round2(Math.min(count / lastMin, 1) * 100),
    steps,
    text,
  }
}