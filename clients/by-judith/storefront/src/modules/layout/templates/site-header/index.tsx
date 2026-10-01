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
import HeaderShell from "@modules/layout/components/header-shell"
import {
  ProceduresPanel,
  ShopPanel,
  type MenuCollection,
} from "@modules/layout/components/menu-panels"
import MobileMenu from "@modules/layout/components/mobile-menu"
import SearchForm from "@modules/layout/components/search-form"

const linkClasses =
  "text-sm text-ink transition-colors duration-150 hover:text-ink-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink overlay:text-white overlay:hover:text-white/80 overlay:focus-visible:outline-white"

/** The booking button turns white over a dark hero. */
const bookOverlayClasses =
  "overlay:bg-white overlay:text-ink overlay:hover:bg-surface-hover overlay:focus-visible:outline-white"

/**
 * Global header (wireframe 00 · A/B). The full desktop bar needs about 1 200px,
 * so it starts at `medium` (1280px); narrower screens get the menu button,
 * centred logo and cart, with "Rezervovat" below the bar.
 *
 * Over a dark hero the header and booking bar are transparent with light text
 * (the `overlay:` variant, see HeaderShell). The hero then starts under them:
 * 114px on `medium` (service bar 33 + bar 81), 129px below it (bar 65 +
 * booking bar 64).
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
    <HeaderShell>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:outline focus:outline-2 focus:outline-ink"
      >
        {t("skipToContent")}
      </a>

      {/* The service bar (2rem + its 1px border) scrolls away; the main bar stays pinned. */}
      <header className="sticky top-0 z-50 border-b border-line bg-white transition-colors duration-300 medium:-top-[33px] overlay:border-transparent overlay:bg-transparent">
        <div className="hidden border-b border-line bg-surface transition-colors duration-300 medium:block overlay:border-transparent overlay:bg-transparent">
          <Container
            width="page"
            className="flex h-8 items-center justify-end gap-3 text-xs text-ink-subtle overlay:text-white/85"
          >
            <span data-testid="free-delivery-note">
              {t("freeDelivery", {
                amount: convertToLocale({ amount: freeDeliveryFrom, currency_code: "czk" }),
              })}
            </span>
            <span aria-hidden="true">·</span>
            <a
              href={contact.phone.href}
              className="flex items-center gap-1 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink overlay:hover:text-white overlay:focus-visible:outline-white"
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
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink overlay:focus-visible:outline-white"
          >
            <Image
              src="/logo_gold.svg"
              alt={t("logoAlt")}
              width={160}
              height={202}
              priority
              className="h-11 w-auto medium:h-14"
            />
          </LocalizedClientLink>

          <div className="flex h-full items-center justify-end gap-5">
            <SearchForm countryCode={countryCode} className="hidden w-48 medium:flex" />
            <CartDropdown cart={cart} />
            <ButtonLink href={bookingPath} className={`hidden medium:inline-flex ${bookOverlayClasses}`}>
              {t("book")}
            </ButtonLink>
          </div>
        </Container>
      </header>

      {/* Positioned so a hero pulled up under it does not cover it. */}
      <Container className="relative z-40 py-3 medium:hidden">
        <ButtonLink
          href={bookingPath}
          fullWidth
          className={`mx-auto flex max-w-md ${bookOverlayClasses}`}
        >
          {t("book")}
        </ButtonLink>
      </Container>
    </HeaderShell>
  )
}
