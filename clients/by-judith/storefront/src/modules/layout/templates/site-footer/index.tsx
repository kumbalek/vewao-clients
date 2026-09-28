import Image from "next/image"
import { useTranslations } from "next-intl"
import React from "react"

import { contact, footer } from "content/site"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { CopyText, Placeholder } from "@modules/common/components/placeholder"
import { Container, Heading, Text } from "@modules/design-system"
import type { MenuCollection } from "@modules/layout/components/menu-panels"

const linkClasses =
  "hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"

function Column({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <Heading
        id={id}
        level={2}
        size="sm"
        className="text-xs uppercase tracking-widest text-ink-subtle"
      >
        {title}
      </Heading>
      {children}
    </section>
  )
}

/** Global footer (wireframe 00 · D). */
export default function SiteFooter({ collections }: { collections: MenuCollection[] }) {
  const t = useTranslations("layout")

  const quickLinks = [
    { label: t("allProducts"), href: "/store" },
    ...collections.slice(0, 3).map((c) => ({ label: c.title, href: `/collections/${c.handle}` })),
    { label: t("magazin"), href: "/magazin" },
    { label: t("about"), href: "/o-nas" },
    { label: t("customerService"), href: "/content/customer-service" },
    { label: t("contact"), href: "/content/contact" },
  ]

  return (
    <footer className="border-t border-line bg-surface" data-testid="site-footer">
      <Container
        width="page"
        className="grid gap-10 py-12 xsmall:grid-cols-2 small:grid-cols-4 small:py-16"
      >
        <div className="flex flex-col items-start gap-4">
          <LocalizedClientLink href="/" className={linkClasses}>
            {/* The logo file has a white background; multiply drops it on the grey. */}
            <Image
              src="/logo.webp"
              alt={t("logoAlt")}
              width={120}
              height={41}
              className="mix-blend-multiply"
            />
          </LocalizedClientLink>
          <Text size="sm" tone="subtle">
            <CopyText value={footer.about} />
          </Text>
          <Text size="sm" tone="subtle">
            <CopyText value={footer.social} />
          </Text>
        </div>

        <Column id="footer-links" title={t("quickLinks")}>
          <ul className="flex flex-col gap-2 text-sm text-ink-subtle">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <LocalizedClientLink href={link.href} className={linkClasses}>
                  {link.label}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </Column>

        <Column id="footer-contact" title={t("contactAndHours")}>
          <address className="flex flex-col gap-1 text-sm not-italic text-ink-subtle">
            <span>{contact.name}</span>
            <span>{contact.street}</span>
            <span>{contact.city}</span>
            <a href={contact.phone.href} className={`mt-2 ${linkClasses}`}>
              {contact.phone.label}
            </a>
            <a href={`mailto:${contact.email}`} className={linkClasses}>
              {contact.email}
            </a>
          </address>
          <Text size="sm" tone="subtle">
            {contact.hours}
          </Text>
        </Column>

        <Column id="footer-newsletter" title={t("newsletter")}>
          <Text size="sm" tone="subtle">
            <CopyText value={footer.newsletter} />
          </Text>
        </Column>
      </Container>

      <div className="border-t border-line bg-white">
        <Container
          width="page"
          className="flex flex-col gap-4 py-6 text-xs text-ink-subtle small:flex-row small:items-center small:justify-between"
        >
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footer.legal.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <LocalizedClientLink href={link.href} className={linkClasses}>
                    {link.label}
                  </LocalizedClientLink>
                ) : (
                  <Placeholder>{link.label}</Placeholder>
                )}
              </li>
            ))}
            <li>{t("copyright", { year: new Date().getFullYear() })}</li>
          </ul>
          <CopyText value={footer.paymentMethods} />
        </Container>
      </div>
    </footer>
  )
}
