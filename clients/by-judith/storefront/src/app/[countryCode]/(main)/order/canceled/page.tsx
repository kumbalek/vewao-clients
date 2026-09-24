import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string }>
}

/**
 * Legacy gateway return URL. The gateway's cancel redirect is not proof either
 * way, so hand over to the route that asks the backend.
 */
export default async function OrderCanceledPage(props: Props) {
  const { countryCode } = await props.params

  redirect(`/${countryCode}/checkout/payment-return`)
}
