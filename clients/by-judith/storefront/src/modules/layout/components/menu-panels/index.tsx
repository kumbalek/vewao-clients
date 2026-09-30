import { useTranslations } from "next-intl"

import type { ProcedureCategory } from "content/site"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { CopyText, Placeholder } from "@modules/common/components/placeholder"
import { ArrowLink, Container, Text } from "@modules/design-system"

export type MenuCollection = { id: string; handle: string; title: string }

const pillClasses =
  "block rounded-full border border-line bg-white px-4 py-2 text-sm text-ink transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"

/** Procedure categories side by side: description on the left, procedures on the right. */
export function ProceduresPanel({ categories }: { categories: ProcedureCategory[] }) {
  const t = useTranslations("layout")

  if (!categories.length) {
    return (
      <Container width="page" className="py-8">
        <Placeholder className="text-sm">{t("procedures")}</Placeholder>
      </Container>
    )
  }

  return (
    <Container width="page" className="grid gap-10 py-8 small:grid-cols-2">
      {categories.map((category) => (
        <div
          key={category.title}
          className="grid grid-cols-2 gap-6 border-line small:border-l small:pl-10 small:first:border-l-0 small:first:pl-0"
        >
          <div className="flex flex-col items-start gap-3">
            <Text as="span" size="xs" tone="subtle" className="uppercase tracking-widest">
              {category.title}
            </Text>
            <Text size="sm" tone="subtle">
              <CopyText value={category.description} />
            </Text>
            {category.href ? (
              <ArrowLink href={category.href} className="text-sm">
                {t("showMore")}
              </ArrowLink>
            ) : (
              <Placeholder className="text-sm">{t("showMore")}</Placeholder>
            )}
          </div>
          <ul className="flex flex-col gap-2">
            {category.procedures.map((procedure, index) => (
              <li key={index}>
                {procedure.href ? (
                  <LocalizedClientLink href={procedure.href} className={pillClasses}>
                    <CopyText value={procedure.title} />
                  </LocalizedClientLink>
                ) : (
                  <span className="block rounded-full border border-line px-4 py-2 text-sm">
                    <CopyText value={procedure.title} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Container>
  )
}

/** The e-shop's front page, its collections from the catalogue and the full product list. */
export function ShopPanel({ collections }: { collections: MenuCollection[] }) {
  const t = useTranslations("layout")

  return (
    <Container width="page" className="flex flex-col gap-4 py-8">
      <ArrowLink href="/shop" className="text-sm">
        {t("shopHome")}
      </ArrowLink>
      {collections.length > 0 && (
        <>
          <Text as="span" size="xs" tone="subtle" className="uppercase tracking-widest">
            {t("collections")}
          </Text>
          <ul className="flex flex-wrap gap-2">
            {collections.map((collection) => (
              <li key={collection.id}>
                <LocalizedClientLink
                  href={`/collections/${collection.handle}`}
                  className={pillClasses}
                >
                  {collection.title}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </>
      )}
      <ArrowLink href="/store" className="text-sm">
        {t("allProducts")}
      </ArrowLink>
    </Container>
  )
}
