import { cookies, draftMode } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import { PREVIEW_COOKIE, verifyPreview } from "@lib/cms/preview-token"

/**
 * Opens a signed CMS preview link: enables Next.js draft mode and remembers
 * which page (and whether editing links show) until the link expires.
 */
export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams)
  const grant = verifyPreview(process.env.CMS_PREVIEW_SECRET, params)
  if (!grant) return new NextResponse("Odkaz na náhled je neplatný nebo vypršel.", { status: 401 })

  ;(await draftMode()).enable()
  const crossSite = process.env.NODE_ENV === "production"
  ;(await cookies()).set(PREVIEW_COOKIE, JSON.stringify(grant), {
    httpOnly: true,
    // Live Preview loads the storefront in the CMS admin's iframe.
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite,
    path: "/",
    maxAge: Math.max(0, grant.expires - Math.floor(Date.now() / 1000)),
  })
  return NextResponse.redirect(new URL(grant.path, request.nextUrl.origin))
}
