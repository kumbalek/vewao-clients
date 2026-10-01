import { clx } from "@medusajs/ui"
import Form from "next/form"
import { useTranslations } from "next-intl"

import { SearchIcon } from "@modules/design-system/components/icons"

/** Product search: a GET form to the store page, so it works before hydration. */
export default function SearchForm({
  countryCode,
  className,
}: {
  countryCode: string
  className?: string
}) {
  const t = useTranslations("layout")

  return (
    <Form
      action={`/${countryCode}/store`}
      role="search"
      className={clx(
        "flex h-10 items-center rounded-full border border-line bg-surface pl-4 pr-1 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink overlay:border-white/40 overlay:bg-white/10 overlay:focus-within:outline-white",
        className
      )}
    >
      <input
        type="search"
        name="q"
        aria-label={t("searchLabel")}
        placeholder={t("searchPlaceholder")}
        className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none overlay:text-white overlay:placeholder:text-white/70"
      />
      <button
        type="submit"
        aria-label={t("search")}
        className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface-hover hover:text-ink overlay:text-white/85 overlay:hover:bg-white/10 overlay:hover:text-white"
      >
        <SearchIcon size={18} />
      </button>
    </Form>
  )
}
