import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useTranslations } from "next-intl"

import {
  bookingPath,
  contact,
  freeDeliveryFrom,
  navigationLinks,
  type ProcedureCategory,
} from "content/site"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Placeholder } from "@modules/common/components/placeholder"
import { ButtonLink, Container } from "@modules/design-system"
import { PhoneIcon } from "@modules/design-system/components/icons"
import CartDropdown from "@modules/layout/components/cart-dropdown"
import HeaderMenu from "@modules/layout/components/header-menu"
import {
  ProceduresPanel,
  ShopPanel,
  type MenuCollection,
} from "@modules/layout/components/menu-panels"
import MobileMenu from "@modules/layout/components/mobile-menu"
import SearchForm from "@modules/layout/components/search-form"

const linkClasses =
  "text-sm text-ink transition-colors duration-150 hover:text-ink-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"

/**
 * Global header (wireframe 00 · A/B). The full desktop bar needs about 1 200px,
 * so it starts at `medium` (1280px); narrower screens get the menu button,
 * centred logo and cart, with "Rezervovat" below the bar.
 */
export default function SiteHeader({
  countryCode,
  cart,
  collections,
  procedureMenu,
}: {
  countryCode: string
  cart: HttpTypes.StoreCart | null
  collections: MenuCollection[]
  procedureMenu: ProcedureCategory[]
}) {
  const t = useTranslations("layout")
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:outline focus:outline-2 focus:outline-ink"
      >
        {t("skipToContent")}
      </a>

      {/* The service bar (2rem + its 1px border) scrolls away; the main bar stays pinned. */}
      <header className="sticky top-0 z-50 border-b border-line bg-white medium:-top-[33px]">
        <div className="hidden border-b border-line bg-surface medium:block">
          <Container
            width="page"
            className="flex h-8 items-center justify-end gap-3 text-xs text-ink-subtle"
          >
            <span data-testid="free-delivery-note">
              {t("freeDelivery", {
                amount: convertToLocale({ amount: freeDeliveryFrom, currency_code: "czk" }),
              })}
            </span>
            <span aria-hidden="true">·</span>
            <a
              href={contact.phone.href}
              className="flex items-center gap-1 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
            >
              <PhoneIcon size={14} />
              {contact.phone.label}
            </a>
          </Container>
        </div>
        <Container
          width="page"
          className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-6 medium:h-20"
        >
          <div className="flex h-full items-center">
            <div className="medium:hidden">
              <MobileMenu
                countryCode={countryCode}
                categories={procedureMenu}
                collections={collections}
                links={navigationLinks}
                cartCount={cartCount}
                bookingPath={bookingPath}
              />
            </div>
            <nav
              aria-label={t("mainNavigation")}
              className="hidden h-full items-center gap-4 medium:flex large:gap-6"
            >
              <HeaderMenu label={t("procedures")}>
                <ProceduresPanel categories={procedureMenu} />
              </HeaderMenu>
              <HeaderMenu label={t("shop")}>
                <ShopPanel collections={collections} />
              </HeaderMenu>
              {navigationLinks.map((link) =>
                link.href ? (
                  <LocalizedClientLink key={link.label} href={link.href} className={linkClasses}>
                    {link.label}
                  </LocalizedClientLink>
                ) : (
                  <Placeholder key={link.label} compact className="text-sm">
                    {link.label}
                  </Placeholder>
                )
              )}
            </nav>
          </div>

          <LocalizedClientLink
            href="/"
            data-testid="nav-store-link"
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            <Image
              src="/logo.webp"
              alt={t("logoAlt")}
              width={180}
              height={62}
              priority
              className="h-10 w-auto medium:h-12"
            />
          </LocalizedClientLink>

          <div className="flex h-full items-center justify-end gap-5">
            <SearchForm countryCode={countryCode} className="hidden w-48 medium:flex" />
            <CartDropdown cart={cart} />
            <ButtonLink href={bookingPath} className="hidden medium:inline-flex">
              {t("book")}
            </ButtonLink>
          </div>
        </Container>
      </header>

      <Container className="py-3 medium:hidden">
        <ButtonLink href={bookingPath} fullWidth className="mx-auto flex max-w-md">
          {t("book")}
        </ButtonLink>
      </Container>
    </>
  )
}
