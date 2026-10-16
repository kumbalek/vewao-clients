import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string }>
}

/**
 * Legacy gateway return URL. Arriving here proves nothing about the payment,
 * so hand over to the route that asks the backend.
 */
export default async function OrderConfirmedPage(props: Props) {
  const { countryCode } = await props.params

  redirect(`/${countryCode}/checkout/payment-return`)
}
