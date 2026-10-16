import type { NextRequest } from "next/server"

/**
 * Redirect target origin. Behind the reverse proxy the server sees its internal
 * address (0.0.0.0:8000) and `next dev` reports localhost; the preview cookies
 * belong to the shop's public origin.
 */
export function publicOrigin(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") || request.nextUrl.origin
}
