import { cookies, draftMode } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import { PREVIEW_COOKIE } from "@lib/cms/preview-token"

/** Leaves the CMS preview and returns to the published page. */
export async function GET(request: NextRequest) {
  ;(await draftMode()).disable()
  ;(await cookies()).delete(PREVIEW_COOKIE)
  const back = request.nextUrl.searchParams.get("path")
  const safe = back && back.startsWith("/") && !back.startsWith("//") && !back.startsWith("/\\") ? back : "/"
  return NextResponse.redirect(new URL(safe, request.nextUrl.origin))
}
