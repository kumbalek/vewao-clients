import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { retrieveCustomer } from "@lib/data/customer"
import AccountLayout from "@modules/account/templates/account-layout"

// Both slots resolve on /account, so the title follows the sign-in state here.
export async function generateMetadata(): Promise<Metadata> {
  const [customer, t] = await Promise.all([retrieveCustomer().catch(() => null), getTranslations("metadata")])
  return {
    title: customer ? t("accountTitle") : t("loginTitle"),
    description: customer ? t("accountDescription") : t("loginDescription"),
    robots: { index: false, follow: false },
  }
}

/**
 * Medusa's native customer account (emailpass auth). Signed-in customers get
 * the `@dashboard` slot, everyone else the `@login` slot.
 */
export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  return <AccountLayout customer={customer}>{customer ? dashboard : login}</AccountLayout>
}
