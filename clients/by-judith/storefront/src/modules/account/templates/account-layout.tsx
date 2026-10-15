import React from "react"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Container, Heading, Section, Text } from "@modules/design-system"

import AccountNav from "../components/account-nav"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

/** Medusa's customer account: navigation once signed in, the sign-in forms otherwise. */
const AccountLayout: React.FC<AccountLayoutProps> = ({ customer, children }) => {
  const t = useTranslations("customerService")

  return (
    <Section spacing="md" data-testid="account-page">
      <Container width="content" className="flex flex-col gap-12">
        {customer ? (
          <div className="grid grid-cols-1 gap-8 small:grid-cols-[220px_1fr] small:gap-12">
            <AccountNav />
            <div className="min-w-0">{children}</div>
          </div>
        ) : (
          <div className="flex justify-center">{children}</div>
        )}
        <div className="flex flex-col justify-between gap-4 border-t border-line pt-8 small:flex-row small:items-end">
          <div className="flex flex-col gap-2">
            <Heading level={2} size="sm">
              {t("gotQuestions")}
            </Heading>
            <Text size="sm" tone="subtle">
              {t("gotQuestionsText")}
            </Text>
          </div>
          <LocalizedClientLink href="/content/customer-service" className="text-sm underline hover:text-ink-subtle">
            {t("customerServiceLink")}
          </LocalizedClientLink>
        </div>
      </Container>
    </Section>
  )
}

export default AccountLayout
