"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"

import { requestPasswordReset } from "@lib/data/customer"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { Text } from "@modules/design-system"

/**
 * Medusa changes a customer password only with a reset token, so a signed-in
 * customer gets the same e-mailed link as on the sign-in page.
 */
const ProfilePassword = ({ email }: { email: string }) => {
  const t = useTranslations("account")
  const [state, formAction] = useActionState(requestPasswordReset, null)

  return (
    <form action={formAction} className="flex flex-col gap-3 text-small-regular" data-testid="profile-password">
      <input type="hidden" name="email" value={email} />
      <span className="uppercase text-ui-fg-base">{t("password")}</span>
      <Text size="sm" tone="subtle" role={state ? "status" : undefined}>
        {state === "sent" ? t("resetSent") : state === "error" ? t("error") : t("passwordHint")}
      </Text>
      {state !== "sent" && (
        <div>
          <SubmitButton variant="secondary" data-testid="change-password-button">
            {t("changePassword")}
          </SubmitButton>
        </div>
      )}
    </form>
  )
}

export default ProfilePassword
