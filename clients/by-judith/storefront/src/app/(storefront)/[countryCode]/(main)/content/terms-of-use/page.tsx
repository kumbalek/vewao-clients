import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { termsOfUse } from "content/legal/terms-of-use"
import { Container } from "@modules/design-system"
import LegalDocument from "@modules/legal/components/legal-document"
import Help from "@modules/order/components/help"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")

  return {
    title: t("termsTitle"),
  }
}

/**
 * The merchant's terms, effective 2026-12-01 (owner, 2026-11-25). Clause IV.2
 * names the checkout's last button, "Objednat s povinností platby"
 * (messages: checkout.placeOrder); keep the two the same.
 */
export default function TermsPage() {
  return (
    <>
      <LegalDocument document={termsOfUse} />
      <Container width="text" className="pb-12">
        <Help />
      </Container>
    </>
  )
}
