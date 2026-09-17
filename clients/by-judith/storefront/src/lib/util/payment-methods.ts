/** The existing client supports Comgate and manual in-store payment only. */
export const isManual = (providerId?: string) =>
  providerId === "pp_system_default"
export const isComgate = (providerId?: string) =>
  providerId?.startsWith("pp_comgate_") ?? false

export function availablePaymentMethods<T extends { id: string }>(
  methods: T[],
  shippingAmount: number | undefined
): T[] {
  // Preserve the inherited zero-price shipping rule until fulfilment setup is confirmed.
  return methods.filter(
    (method) =>
      isComgate(method.id) || (isManual(method.id) && shippingAmount === 0)
  )
}
