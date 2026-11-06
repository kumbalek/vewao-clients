import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "cz"

/**
 * The country codes the shop serves (/cz, /sk, …): every country of every
 * region, so each has its currency (vewao-clients#45). Cached for an hour; the
 * last good list stays if the backend cannot be reached.
 */
const countryCache = { countries: new Set<string>(), updated: 0 }

async function servedCountries(): Promise<Set<string>> {
  if (countryCache.countries.size && countryCache.updated > Date.now() - 3600 * 1000) {
    return countryCache.countries
  }
  try {
    if (!BACKEND_URL) throw new Error("MEDUSA_BACKEND_URL is not set")
    const response = await fetch(`${BACKEND_URL}/store/regions?fields=countries.iso_2`, {
      headers: { "x-publishable-api-key": PUBLISHABLE_API_KEY ?? "" },
      cache: "no-store",
    })
    const json = (await response.json()) as { regions?: { countries?: { iso_2?: string | null }[] | null }[]; message?: string }
    if (!response.ok) throw new Error(json.message ?? `HTTP ${response.status}`)
    const countries = new Set(
      (json.regions ?? []).flatMap((region) => (region.countries ?? []).flatMap((c) => (c.iso_2 ? [c.iso_2] : [])))
    )
    if (countries.size) {
      countryCache.countries = countries
      countryCache.updated = Date.now()
    }
  } catch (error) {
    console.error("proxy: regions could not be loaded", error)
  }
  return countryCache.countries.size ? countryCache.countries : new Set([DEFAULT_REGION])
}

/**
 * Dev and local instances serve the real shop's content, so every host sends
 * noindex unless ALLOW_INDEXING=true is set at runtime (production only).
 * Crawling stays allowed in robots.txt so crawlers can see this header.
 */
export async function proxy(request: NextRequest) {
  const response = await routeRequest(request)

  if (process.env.ALLOW_INDEXING !== "true") {
    response.headers.set("X-Robots-Tag", "noindex, nofollow")
  }

  return response
}

/**
 * Handles region selection and onboarding status.
 */
async function routeRequest(request: NextRequest) {
  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()
  const countries = await servedCountries()
  const urlHasCountryCode = countries.has(request.nextUrl.pathname.split("/")[1]?.toLowerCase() ?? "")

  // A country in the address and the cache id set: serve it.
  if (urlHasCountryCode && cacheIdCookie) {
    return NextResponse.next()
  }

  // Static assets need neither.
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  // A country but no cache id yet: set it and load the same address again.
  if (urlHasCountryCode) {
    const response = NextResponse.redirect(request.nextUrl.href, 307)
    response.cookies.set("_medusa_cache_id", cacheId, { maxAge: 60 * 60 * 24 })
    return response
  }

  // No country in the address: the default one (Czech, CZK).
  const path = request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
  return NextResponse.redirect(`${request.nextUrl.origin}/${DEFAULT_REGION}${path}${request.nextUrl.search}`, 307)
}

export const config = {
  matcher: [
    // /admin is the Payload CMS (no country code), /api its REST API and ours.
    "/((?!api|admin|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
