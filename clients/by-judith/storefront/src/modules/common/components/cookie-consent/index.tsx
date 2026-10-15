"use client"

import Script from "next/script"
import { useEffect, useRef } from "react"
// The components entry, not the package root: the root also exports the
// Medusa client and checkout, which this client component must not pull in.
import {
  ConsentGate,
  CookieConsent,
  openCookieSettings,
  useConsent,
  type ConsentCategoryOption,
} from "@vewao/storefront-kit/components"
import type { ConsentRecord } from "@vewao/storefront-kit"

import { cookieConsent } from "content/site"
import { CONSENT_VERSION, consentCategories, gaMeasurementId } from "@lib/consent"

const COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "cz"

const OPTIONS: Record<string, ConsentCategoryOption> = {
  analytics: { id: "analytics", ...cookieConsent.analytics },
}

/** Deletes Google Analytics cookies on this host and its parent domains. */
function clearAnalyticsCookies() {
  const names = document.cookie
    .split("; ")
    .map((entry) => entry.split("=")[0] ?? "")
    .filter((name) => name === "_ga" || name.startsWith("_ga_"))
  const parts = window.location.hostname.split(".")
  const domains = [""].concat(parts.map((_, i) => `; Domain=.${parts.slice(i).join(".")}`))
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Path=/; Max-Age=0${domain}`
    }
  }
}

/** GA4, rendered only inside the analytics consent gate. */
function GoogleAnalytics({ id }: { id: string }) {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-config" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  )
}

/**
 * The kit's consent banner with By Judith's copy, and the scripts it gates.
 * Renders nothing while no optional category is configured. A script cannot
 * be unloaded, so withdrawing analytics consent deletes GA's cookies and
 * reloads the page without it.
 */
export default function SiteCookieConsent() {
  const categories = consentCategories()
  const measurementId = gaMeasurementId()
  const record = useConsent({ version: CONSENT_VERSION })
  const analyticsGranted = useRef(false)

  useEffect(() => {
    analyticsGranted.current = record?.granted.includes("analytics") ?? false
  }, [record])

  if (categories.length === 0) {
    return null
  }

  const handleChange = (next: ConsentRecord) => {
    if (analyticsGranted.current && !next.granted.includes("analytics")) {
      clearAnalyticsCookies()
      window.location.reload()
    }
  }

  return (
    <>
      <CookieConsent
        version={CONSENT_VERSION}
        categories={categories.map((id) => OPTIONS[id]).filter((option): option is ConsentCategoryOption => !!option)}
        copy={cookieConsent.copy}
        policyHref={`/${COUNTRY}/content/cookies`}
        policyLabel={cookieConsent.policyLabel}
        onChange={handleChange}
      />
      {measurementId && (
        <ConsentGate category="analytics" version={CONSENT_VERSION}>
          <GoogleAnalytics id={measurementId} />
        </ConsentGate>
      )}
    </>
  )
}

/** Reopens the banner; the footer shows it only while consent is in use. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => openCookieSettings()}>
      {cookieConsent.settingsLabel}
    </button>
  )
}
