type ItemTotalRule = { attribute: string; operator: string; value: string }

/** Smallest currency step (haléř / cent) used to reach a strict `gt` threshold. */
const MINOR_UNIT = 0.01

export type FreeShippingTarget = {
  current_amount: number
  target_amount: number
  target_reached: boolean
  target_remaining: number
  remaining_percentage: number
}

/**
 * Progress towards a conditional shipping price whose rule is on the cart's
 * item total. By Judith's free PPL price uses `gt 4999.99` (see the seed), so a
 * strict threshold needs one haléř more, not a whole koruna.
 */
export function freeShippingTarget(
  itemTotal: number,
  rule: ItemTotalRule
): FreeShippingTarget {
  const target = parseFloat(rule.value)
  const threshold =
    rule.operator === "gt"
      ? target + MINOR_UNIT
      : rule.operator === "lt"
      ? target - MINOR_UNIT
      : target
  const reached =
    rule.operator === "lt" || rule.operator === "lte"
      ? itemTotal <= threshold
      : itemTotal >= threshold
  const remaining = reached
    ? 0
    : Math.round(Math.abs(threshold - itemTotal) * 100) / 100

  return {
    current_amount: itemTotal,
    target_amount: threshold,
    target_reached: reached,
    target_remaining: remaining,
    remaining_percentage: (itemTotal / threshold) * 100,
  }
}
