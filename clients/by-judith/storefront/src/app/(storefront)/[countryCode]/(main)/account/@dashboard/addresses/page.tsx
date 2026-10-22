import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { getRegion } from "@lib/data/regions"
import AddressBook from "@modules/account/components/address-book"
import { Heading, Text } from "@modules/design-system"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return { title: t("addressesTitle"), description: t("addressesDescription") }
}

export default async function Addresses(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
  const [customer, region, t] = await Promise.all([
    retrieveCustomer(),
    getRegion(countryCode),
    getTranslations("account"),
  ])
  if (!customer || !region) notFound()

  return (
    <div className="flex flex-col gap-8" data-testid="addresses-page-wrapper">
      <div className="flex flex-col gap-2">
        <Heading level={1} size="lg">
          {t("addresses")}
        </Heading>
        <Text tone="subtle">{t("addressesText")}</Text>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}
