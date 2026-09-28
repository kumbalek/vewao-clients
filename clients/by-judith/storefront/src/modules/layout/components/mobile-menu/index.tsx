"use client"

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import React, { useState } from "react"

import type { NavLink, ProcedureCategory } from "content/site"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { CopyText, Placeholder } from "@modules/common/components/placeholder"
import { ButtonLink } from "@modules/design-system"
import { ChevronIcon, CloseIcon, MenuIcon } from "@modules/design-system/components/icons"
import type { MenuCollection } from "@modules/layout/components/menu-panels"
import SearchForm from "@modules/layout/components/search-form"

const rowClasses = "flex w-full items-center justify-between py-4 text-lg text-ink"
const subLinkClasses = "block py-2 text-base text-ink-subtle hover:text-ink"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group">
      <summary
        className={`${rowClasses} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
      >
        {title}
        <ChevronIcon className="transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  )
}

/** Below the `medium` breakpoint the header collapses into this full-screen menu. */
export default function MobileMenu({
  countryCode,
  categories,
  collections,
  links,
  cartCount,
  bookingPath,
}: {
  countryCode: string
  categories: ProcedureCategory[]
  collections: MenuCollection[]
  links: NavLink[]
  cartCount: number
  bookingPath: string
}) {
  const t = useTranslations("layout")
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        aria-label={t("openMenu")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        data-testid="nav-menu-button"
        className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
      >
        <MenuIcon size={24} />
      </button>
      <Dialog open={open} onClose={close} className="fixed inset-0 z-[60]">
        <DialogPanel
          transition
          data-testid="nav-menu-popup"
          onClick={(event) => {
            if ((event.target as Element).closest("a")) close()
          }}
          onSubmit={close}
          className="flex h-full flex-col bg-white transition duration-200 data-[closed]:opacity-0 motion-reduce:transition-none"
        >
          <DialogTitle className="sr-only">{t("menu")}</DialogTitle>
          <div className="flex h-16 flex-none items-center justify-between border-b border-line px-6">
            <LocalizedClientLink href="/">
              <Image
                src="/logo.webp"
                alt={t("logoAlt")}
                width={140}
                height={48}
                className="h-10 w-auto"
              />
            </LocalizedClientLink>
            <button
              type="button"
              autoFocus
              aria-label={t("closeMenu")}
              onClick={close}
              className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
            >
              <CloseIcon size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <SearchForm countryCode={countryCode} />
            <nav aria-label={t("mainNavigation")} className="mt-2">
              <ul className="divide-y divide-line">
                <li>
                  <Section title={t("procedures")}>
                    {!categories.length && (
                      <Placeholder className="text-base">{t("procedures")}</Placeholder>
                    )}
                    {categories.map((category) => (
                      <div key={category.title} className="py-2">
                        {category.href ? (
                          <LocalizedClientLink href={category.href} className={subLinkClasses}>
                            {category.title}
                          </LocalizedClientLink>
                        ) : (
                          <span className="block py-2 text-base text-ink">{category.title}</span>
                        )}
                        <ul className="border-l border-line pl-4">
                          {category.procedures.map((procedure, index) => (
                            <li key={index}>
                              {procedure.href ? (
                                <LocalizedClientLink href={procedure.href} className={subLinkClasses}>
                                  <CopyText value={procedure.title} />
                                </LocalizedClientLink>
                              ) : (
                                <span className="block py-2 text-base">
                                  <CopyText value={procedure.title} />
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </Section>
                </li>
                <li>
                  <Section title={t("shop")}>
                    <ul>
                      <li>
                        <LocalizedClientLink href="/store" className={subLinkClasses}>
                          {t("allProducts")}
                        </LocalizedClientLink>
                      </li>
                      {collections.map((collection) => (
                        <li key={collection.id}>
                          <LocalizedClientLink
                            href={`/collections/${collection.handle}`}
                            className={subLinkClasses}
                          >
                            {collection.title}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>
                  </Section>
                </li>
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <LocalizedClientLink href={link.href} className={rowClasses}>
                        {link.label}
                      </LocalizedClientLink>
                    ) : (
                      <span className={rowClasses}>
                        <Placeholder>{link.label}</Placeholder>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="grid flex-none grid-cols-2 gap-3 border-t border-line p-4">
            <ButtonLink href="/cart" variant="secondary">
              {t("cartCount", { count: cartCount })}
            </ButtonLink>
            <ButtonLink href={bookingPath}>{t("book")}</ButtonLink>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  )
}
