import { useTranslations } from "next-intl"

import type { Faq } from "@lib/data/clinic"
import { PlainText } from "@modules/common/components/rich-text"
import { Heading } from "@modules/design-system"

/** Questions that open in place; native <details>, so no script is needed. */
export default function FaqList({ items }: { items: Faq[] }) {
  const t = useTranslations("procedures")

  return (
    <section aria-labelledby="faq-title" data-testid="faq">
      <Heading id="faq-title" level={2} size="lg">
        {t("faq")}
      </Heading>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.id}>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg text-ink [&::-webkit-details-marker]:hidden">
                {item.title}
                <span
                  aria-hidden="true"
                  className="text-2xl leading-none text-ink-subtle transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                >
                  +
                </span>
              </summary>
              <PlainText text={item.body ?? ""} className="pb-6 text-base leading-7 text-ink-subtle" />
            </details>
          </li>
        ))}
      </ul>
    </section>
  )
}
