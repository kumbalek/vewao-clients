import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import ResetPassword from "@modules/account/components/reset-password"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account")
  return { title: t("newPasswordTitle") }
}

type Props = { searchParams: Promise<{ token?: string | string[] }> }

/** Target of the platform's password reset e-mail (`/account/reset-password?token=…`). */
export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams
  return <ResetPassword token={(Array.isArray(token) ? token[0] : token) ?? ""} />
}
