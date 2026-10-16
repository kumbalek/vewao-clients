import { completeRedirectPayment } from "@lib/data/cart"
import { redirect } from "next/navigation"
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "cz"

/**
 * Comgate's return URL for paid, cancelled and pending payments alike. The
 * outcome comes from the backend asking Comgate; query parameters such as
 * `id` and `refId` are informational only and never decide the result.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ countryCode: string }> }
) {
  const { countryCode } = await params
  const country = /^[a-z]{2}$/.test(countryCode) ? countryCode : DEFAULT_REGION

  const result = await completeRedirectPayment()

  switch (result.status) {
    case "order":
      redirect(`/${result.countryCode ?? country}/order/${result.orderId}/confirmed`)
    case "failed":
      redirect(`/${country}/checkout?step=payment&payment=failed`)
    case "pending":
      redirect(`/${country}/order/pending`)
    case "missing":
      redirect(`/${country}/order/pending?cart=missing`)
  }
}
