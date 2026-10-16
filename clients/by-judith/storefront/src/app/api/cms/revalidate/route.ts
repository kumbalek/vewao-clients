import { timingSafeEqual } from "node:crypto"
import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

const TAG = /^cms:(pages|news|products)(:[a-z0-9-]+)?$/

/** Called by the CMS after a publish, unpublish or delete. */
export async function POST(request: NextRequest) {
  const secret = process.env.CMS_REVALIDATE_SECRET
  const given = request.headers.get("x-revalidate-secret") ?? ""
  if (!secret || given.length !== secret.length || !timingSafeEqual(Buffer.from(given), Buffer.from(secret))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  const body = (await request.json().catch(() => ({}))) as { tags?: unknown }
  const tags = Array.isArray(body.tags) ? body.tags.filter((tag): tag is string => typeof tag === "string" && TAG.test(tag)) : []
  for (const tag of tags) revalidateTag(tag)
  return NextResponse.json({ revalidated: tags })
}
