import type { ConsentCategory } from "@vewao/storefront-kit"

/**
 * Bump to discard every stored decision and ask again, e.g. when a new
 * optional category or a different analytics provider is added.
 */
export const CONSENT_VERSION = 1

const MEASUREMENT_ID = /^G-[A-Z0-9]{4,20}$/

/** The shop's GA4 measurement ID, or null when analytics is off. */
export function gaMeasurementId(): string | null {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()
  return id && MEASUREMENT_ID.test(id) ? id : null
}

/** Optional cookie categories in use. Empty: nothing needs consent, no banner. */
export function consentCategories(): ConsentCategory[] {
  return gaMeasurementId() ? ["analytics"] : []
}
