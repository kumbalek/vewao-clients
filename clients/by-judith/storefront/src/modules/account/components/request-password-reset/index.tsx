"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"

import { requestPasswordReset } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { Heading, Text } from "@modules/design-system"

/** Asks Medusa to e-mail a reset link. The answer is the same whether or not the account exists. */
const RequestPasswordReset = ({ setCurrentView }: { setCurrentView: (view: LOGIN_VIEW) => void }) => {
  const t = useTranslations("account")
  const [state, formAction] = useActionState(requestPasswordReset, null)

  return (
    <div className="flex w-full max-w-sm flex-col items-center" data-testid="reset-request-page">
      <Heading level={1} size="lg" className="mb-4 text-center">
        {t("resetTitle")}
      </Heading>
      {state === "sent" ? (
        <Text role="status" className="text-center" data-testid="reset-request-sent">
          {t("resetSent")}
        </Text>
      ) : (
        <>
          <Text tone="subtle" className="mb-8 text-center">
            {t("resetText")}
          </Text>
          <form className="w-full" action={formAction}>
            <Input label={t("email")} name="email" type="email" autoComplete="email" required data-testid="email-input" />
            <ErrorMessage error={state === "error" ? t("error") : null} data-testid="reset-request-error" />
            <SubmitButton className="mt-6 w-full" data-testid="reset-request-button">
              {t("resetSend")}
            </SubmitButton>
          </form>
        </>
      )}
      <button type="button" onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)} className="mt-6 text-sm underline">
        {t("backToLogin")}
      </button>
    </div>
  )
}

export default RequestPasswordReset
