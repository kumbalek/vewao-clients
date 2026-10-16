import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { retrieveCustomer } from "@lib/data/customer"
import { listRegions } from "@lib/data/regions"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import ProfileName from "@modules/account/components/profile-name"
import ProfilePassword from "@modules/account/components/profile-password"
import ProfilePhone from "@modules/account/components/profile-phone"
import { Heading, Text } from "@modules/design-system"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return { title: t("profileTitle"), description: t("profileDescription") }
}

const Divider = () => <div className="h-px w-full bg-line" />

export default async function Profile() {
  const [customer, regions, t] = await Promise.all([
    retrieveCustomer(),
    listRegions(),
    getTranslations("account"),
  ])
  if (!customer || !regions) notFound()

  return (
    <div className="flex w-full flex-col gap-8" data-testid="profile-page-wrapper">
      <div className="flex flex-col gap-2">
        <Heading level={1} size="lg">
          {t("profile")}
        </Heading>
        <Text tone="subtle">{t("profileText")}</Text>
      </div>
      <div className="flex w-full flex-col gap-y-8">
        <ProfileName customer={customer} />
        <Divider />
        <div className="flex flex-col gap-1 text-small-regular" data-testid="profile-email">
          <span className="uppercase text-ui-fg-base">{t("email")}</span>
          <span className="font-semibold">{customer.email}</span>
          <Text size="xs" tone="muted">
            {t("emailHint")}
          </Text>
        </div>
        <Divider />
        <ProfilePhone customer={customer} />
        <Divider />
        <ProfileBillingAddress customer={customer} regions={regions} />
        <Divider />
        <ProfilePassword email={customer.email} />
      </div>
    </div>
  )
}
