import { cookies, draftMode } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import { publicOrigin } from "@lib/cms/public-origin"

import { PREVIEW_COOKIE, previewSecret, verifyPreview } from "@lib/cms/preview-token"

/**
 * Opens a signed CMS preview link: enables Next.js draft mode and remembers
 * which page (and whether editing links show) until the link expires.
 */
export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams)
  const grant = verifyPreview(previewSecret(), params)
  if (!grant) return new NextResponse("Odkaz na náhled je neplatný nebo vypršel.", { status: 401 })

  ;(await draftMode()).enable()
  ;(await cookies()).set(PREVIEW_COOKIE, JSON.stringify(grant), {
    httpOnly: true,
    // Live Preview's iframe is same-origin now that the admin is in this app.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.max(0, grant.expires - Math.floor(Date.now() / 1000)),
  })
  return NextResponse.redirect(new URL(grant.path, publicOrigin(request)))
}
