"use client"

import { clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import { useParams, usePathname } from "next/navigation"
import { useTransition } from "react"

import { signout } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const links = [
  { href: "/account", key: "overview", testId: "overview-link" },
  { href: "/account/profile", key: "profile", testId: "profile-link" },
  { href: "/account/addresses", key: "addresses", testId: "addresses-link" },
  { href: "/account/orders", key: "orders", testId: "orders-link" },
] as const

const itemClasses =
  "whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"

/** Account sections: a scrollable row on mobile, a column from `small`. */
const AccountNav = () => {
  const t = useTranslations("account")
  const pathname = usePathname()
  const { countryCode } = useParams() as { countryCode: string }
  const [pending, startTransition] = useTransition()
  const current = pathname.replace(`/${countryCode}`, "") || "/"

  const isActive = (href: string) =>
    href === "/account" ? current === href : current === href || current.startsWith(`${href}/`)

  return (
    <nav aria-label={t("title")} data-testid="account-nav">
      <ul className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 small:mx-0 small:flex-col small:items-start small:overflow-visible small:px-0">
        {links.map((link) => {
          const active = isActive(link.href)
          return (
            <li key={link.href}>
              <LocalizedClientLink
                href={link.href}
                aria-current={active ? "page" : undefined}
                data-testid={link.testId}
                className={clx(
                  itemClasses,
                  "block",
                  active ? "bg-surface-hover text-ink" : "text-ink-subtle hover:text-ink"
                )}
              >
                {t(link.key)}
              </LocalizedClientLink>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => signout(countryCode))}
            data-testid="logout-button"
            className={clx(itemClasses, "text-ink-subtle hover:text-ink disabled:opacity-60")}
          >
            {t("logout")}
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default AccountNav
