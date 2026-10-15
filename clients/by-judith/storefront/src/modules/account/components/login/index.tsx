"use client"

import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Heading, Text } from "@modules/design-system"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const t = useTranslations("login")
  const tAccount = useTranslations("account")
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <Heading level={1} size="lg" className="mb-4 text-center">
        {t("title")}
      </Heading>
      <Text tone="subtle" className="mb-8 text-center">
        {t("text")}
      </Text>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={t("emailLabel")}
            name="email"
            type="email"
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label={t("passwordLabel")}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message ? tAccount(message === "loginFailed" ? "loginFailed" : "error") : null}
          data-testid="login-error-message"
        />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          {t("loginButton")}
        </SubmitButton>
      </form>
      <button
        type="button"
        onClick={() => setCurrentView(LOGIN_VIEW.RESET)}
        className="mt-4 text-sm underline"
        data-testid="forgot-password-button"
      >
        {tAccount("forgotPassword")}
      </button>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        {t("notMember")}{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          {t("signIn")}
        </button>
        .
      </span>
    </div>
  )
}

export default Login
