"use client"

import { useState } from "react"
import { Heading } from "@medusajs/ui"
import { addToCart } from "@lib/data/cart"
import { useDelayedRefresh } from "@lib/hooks/use-delayed-refresh"

const DIGESTIVE_VARIANT_ID = "variant_01KB3REF254087CSGFV92RZ9ZC"
const SLIM_VARIANT_ID = "variant_01KB3NTKAV7PT66QPJKER1Z75F"

type ActionCard = {
  id: string
  title: string
  subtitle: string
  cta: string
  oldPrice: string
  newPrice: string
  variantIds: string[]
}

const CARDS: ActionCard[] = [
  {
    id: "digestive",
    title: "Digestive",
    subtitle: "Podpora zdravého trávení",
    cta: "Přidat do košíku",
    oldPrice: "1.890 Kč",
    newPrice: "1.290 Kč",
    variantIds: [DIGESTIVE_VARIANT_ID],
  },
  {
    id: "slim",
    title: "Slim",
    subtitle: "Cesta ke štíhlé linii",
    cta: "Přidat do košíku",
    oldPrice: "1.890 Kč",
    newPrice: "1.290 Kč",
    variantIds: [SLIM_VARIANT_ID],
  },
  {
    id: "set",
    title: "Digestive & Slim set",
    subtitle: "Kompletní dvojice se slevou",
    cta: "Přidat set do košíku",
    oldPrice: "3.780 Kč",
    newPrice: "1.900 Kč",
    variantIds: [DIGESTIVE_VARIANT_ID, SLIM_VARIANT_ID],
  },
]

type ActionBannerProps = {
  countryCode: string
}

const ActionBanner = ({ countryCode }: ActionBannerProps) => {
  const { delayedRefresh } = useDelayedRefresh()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [addedId, setAddedId] = useState<string | null>(null)

  const handleAdd = async (card: ActionCard) => {
    if (loadingId) return

    setLoadingId(card.id)
    setAddedId(null)

    for (const variantId of card.variantIds) {
      await addToCart({ variantId, quantity: 1, countryCode })
    }

    await delayedRefresh()

    setLoadingId(null)
    setAddedId(card.id)
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center py-4">
      <Heading level="h2" className="text-2xl small:text-3xl text-center mb-4">
        Akce: Digestive &amp; Slim by Judith
      </Heading>

      <p className="text-sm small:text-base text-ui-fg-subtle text-center max-w-2xl mb-8">
        Nafouklé břicho do plavek zkrátka nepatří. Zabraňte trávicím katastrofám
        na dovolené s našimi prémiovými bylinnými doplňky z řady Herbs by
        JuditH, které vycházejí z tradiční čínské medicíny.
      </p>

      <div className="grid grid-cols-1 small:grid-cols-3 gap-8 w-full">
        {CARDS.map((card) => {
          const isLoading = loadingId === card.id
          const isAdded = addedId === card.id

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleAdd(card)}
              disabled={!!loadingId}
              className="group flex flex-col items-center text-center transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="text-base font-medium text-ui-fg-base">
                {card.title}
              </span>
              <span className="text-xs text-ui-fg-subtle mb-3">
                {card.subtitle}
              </span>
              <div className="flex flex-col items-center mb-4">
                <span className="text-sm text-ui-fg-muted line-through">
                  {card.oldPrice}
                </span>
                <span className="text-xl font-normal text-ui-fg-base">
                  {card.newPrice}
                </span>
              </div>
              <span className="mt-auto inline-flex items-center justify-center w-full max-w-[20rem] small:max-w-none h-10 rounded-[3rem] bg-white border border-ui-border-base text-ui-fg-base text-sm font-medium transition-colors group-hover:bg-ui-bg-base-hover">
                {isLoading ? "Přidávám…" : isAdded ? "Přidáno ✓" : card.cta}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ActionBanner
