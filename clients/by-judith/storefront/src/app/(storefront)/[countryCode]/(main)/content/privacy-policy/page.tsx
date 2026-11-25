import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { privacyPolicy } from "content/legal/privacy-policy"
import { Container } from "@modules/design-system"
import LegalDocument from "@modules/legal/components/legal-document"
import Help from "@modules/order/components/help"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")

  return {
    title: t("privacyTitle"),
  }
}

/** The merchant's privacy information, effective 2026-12-01 (owner, 2026-11-25). */
export default function PrivacyPolicyPage() {
  return (
    <>
      <LegalDocument document={privacyPolicy} />
      <Container width="text" className="pb-12">
        <Help />
      </Container>
    </>
  )
}
