import { Heading } from "@medusajs/ui"
import UnderlineLink from "@modules/common/components/interactive-link"
import React from "react"
import { useTranslations } from "next-intl"

const Help = ({ hide }: { hide?: string }) => {
  const t = useTranslations("confirm")

  return (
    <div className="mt-6">
      <Heading
        level="h2"
        className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
      >
        {t("needHelp")}
      </Heading>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          {hide !== "service" && (
            <li>
              <UnderlineLink href="/content/customer-service">
                {t("customerService")}
              </UnderlineLink>
            </li>
          )}
          {hide !== "contact" && (
            <li>
              <UnderlineLink href="/content/contact">
                {t("contact")}
              </UnderlineLink>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default Help
