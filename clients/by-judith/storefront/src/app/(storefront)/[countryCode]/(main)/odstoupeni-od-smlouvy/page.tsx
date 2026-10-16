import { Metadata } from "next"

import { contact } from "content/site"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { withdrawalPrefill } from "@lib/util/withdrawal"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Container, Heading, Section, Text } from "@modules/design-system"
import WithdrawalForm from "@modules/withdrawal/components/withdrawal-form"

export const metadata: Metadata = {
  title: "Odstoupit od smlouvy",
  description: "Odstoupení od kupní smlouvy uzavřené v e-shopu By Judith.",
}

type Props = {
  searchParams: Promise<{ objednavka?: string | string[] }>
}

/**
 * The withdrawal function required for online consumer contracts (§ 1830a
 * občanského zákoníku). Linked from the footer on every page and from the
 * order confirmation. Merchant-approved return terms belong in the terms page.
 */
export default async function WithdrawalPage({ searchParams }: Props) {
  const { objednavka } = await searchParams
  const initialOrder = (Array.isArray(objednavka) ? objednavka[0] : objednavka)?.slice(0, 50) ?? ""
  const initial = { order_reference: initialOrder, ...(await accountPrefill(initialOrder)) }

  return (
    <Section spacing="md">
      <Container width="text" className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <Heading level={1} size="lg">
            Odstoupit od smlouvy
          </Heading>
          <Text tone="subtle">
            Od kupní smlouvy uzavřené v našem e-shopu můžete odstoupit bez udání důvodu do 14 dnů
            od převzetí zboží. Vyplňte formulář, zkontrolujte údaje a odstoupení potvrďte.
            Potvrzení o jeho přijetí vám pošleme e-mailem.
          </Text>
          <Text size="sm" tone="subtle">
            Podrobnosti o vrácení zboží a peněz najdete v{" "}
            <LocalizedClientLink href="/content/terms-of-use" className="underline hover:text-ink">
              obchodních podmínkách
            </LocalizedClientLink>
            . S dotazy se obraťte na {contact.email} nebo {contact.phone.label}.
          </Text>
        </div>
        <WithdrawalForm initial={initial} />
      </Container>
    </Section>
  )
}

/** A signed-in customer's own order (the account's "Vrátit zboží") fills in the whole form. */
async function accountPrefill(orderReference: string) {
  if (!/^\d+$/.test(orderReference)) return {}
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) return {}
  const orders = (await listOrders(50).catch(() => null)) ?? []
  const order = orders.find((candidate) => String(candidate.display_id) === orderReference)
  return order ? withdrawalPrefill(order, customer) : {}
}
