"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"

import { resetPassword } from "@lib/data/customer"
import { MIN_PASSWORD_LENGTH } from "@lib/util/password"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading, Text } from "@modules/design-system"

/** Sets a new password with the single-use token from the reset e-mail. */
const ResetPassword = ({ token }: { token: string }) => {
  const t = useTranslations("account")
  const [state, formAction] = useActionState(resetPassword, null)
  const error = state === "short" ? t("newPasswordHint") : state === "invalid" || !token
    ? t("newPasswordInvalid") : state === "error" ? t("error") : null

  return (
    <div className="flex w-full max-w-sm flex-col items-center" data-testid="reset-password-page">
      <Heading level={1} size="lg" className="mb-4 text-center">
        {t("newPasswordTitle")}
      </Heading>
      {state === "done" ? (
        <Text role="status" className="text-center" data-testid="reset-password-done">
          {t("newPasswordDone")}
        </Text>
      ) : (
        <form className="w-full" action={formAction}>
          <input type="hidden" name="token" value={token} />
          <Input
            label={t("newPassword")}
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
            data-testid="password-input"
          />
          <Text size="xs" tone="muted" className="mt-2">
            {t("newPasswordHint")}
          </Text>
          <ErrorMessage error={error} data-testid="reset-password-error" />
          <SubmitButton className="mt-6 w-full" data-testid="reset-password-button">
            {t("newPasswordSave")}
          </SubmitButton>
        </form>
      )}
      <LocalizedClientLink href="/account" className="mt-6 text-sm underline">
        {t("backToLogin")}
      </LocalizedClientLink>
    </div>
  )
}

export default ResetPassword
