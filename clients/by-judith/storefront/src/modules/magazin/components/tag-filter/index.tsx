import { useTranslations } from "next-intl"

import { tagLabel } from "@lib/util/magazin"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { buttonClasses } from "@modules/design-system"

/** Topic links; the current one is marked for assistive technology too. */
export default function TagFilter({ tags, active }: { tags: string[]; active?: string }) {
  const t = useTranslations("magazin")
  const options = [
    { label: t("all"), href: "/magazin", current: !active },
    ...tags.map((tag) => ({
      label: tagLabel(tag),
      href: `/magazin?tag=${encodeURIComponent(tag)}`,
      current: tag === active,
    })),
  ]

  return (
    <nav aria-label={t("filterLabel")}>
      <ul className="flex flex-wrap gap-2">
        {options.map(({ label, href, current }) => (
          <li key={href}>
            <LocalizedClientLink
              href={href}
              aria-current={current ? "page" : undefined}
              className={buttonClasses({ variant: current ? "primary" : "secondary", size: "sm" })}
            >
              {label}
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
