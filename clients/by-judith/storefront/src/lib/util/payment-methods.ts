/** The client supports Comgate and pay-on-site at clinic pickup only. */
export const isManual = (providerId?: string) =>
  providerId === "pp_system_default"
export const isComgate = (providerId?: string) =>
  providerId?.startsWith("pp_comgate_") ?? false

type ShippingOptionWithSet = {
  id: string
  service_zone?: { fulfillment_set?: { type?: string | null } | null } | null
}

/**
 * Pickup is a property of the fulfillment set, not of the price: PPL delivery
 * is also free from 5 000 Kč and must still be paid online.
 */
export function isPickupOption(
  optionId: string | null | undefined,
  options: ShippingOptionWithSet[] | null | undefined
): boolean {
  if (!optionId) {
    return false
  }
  const option = options?.find(({ id }) => id === optionId)
  return option?.service_zone?.fulfillment_set?.type === "pickup"
}

export function availablePaymentMethods<T extends { id: string }>(
  methods: T[],
  isPickup: boolean
): T[] {
  return methods.filter(
    (method) => isComgate(method.id) || (isManual(method.id) && isPickup)
  )
}

export type PaymentReturnStatus = "pending" | "failed"

/**
 * Classifies a redirect payment that did not produce an order. The session
 * status comes from the backend asking the gateway, never from the return URL.
 */
export function paymentReturnStatus(
  sessionStatus: string | null | undefined
): PaymentReturnStatus {
  return sessionStatus === "canceled" || sessionStatus === "error"
    ? "failed"
    : "pending"
}
