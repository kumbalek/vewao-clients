import React from "react"
import { useTranslations } from "next-intl"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  const t = useTranslations("customerService")

  return (
    <div className="flex-1 small:py-12" data-testid="account-page">
      <div className="flex-1 content-container h-full max-w-5xl mx-auto bg-white flex flex-col">
        <div
          className={
            customer
              ? "grid grid-cols-1  small:grid-cols-[240px_1fr] py-12"
              : "flex justify-center items-center"
          }
        >
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1">{children}</div>
        </div>
        <div className="flex flex-col small:flex-row small:items-end justify-between border-t border-gray-200 py-12 gap-8">
          <div>
            <h3 className="text-xl  mb-4">{t("gotQuestions")}</h3>
            <span className="txt-medium">{t("gotQuestionsText")}</span>
          </div>
          <div>
            <UnderlineLink href="/content/customer-service">
              {t("customerServiceLink")}
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
