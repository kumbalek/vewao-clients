import type { ReactNode } from "react"

import type { LegalBlock, LegalDocument as LegalDocumentData } from "content/legal/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Container, Heading, Section, Text } from "@modules/design-system"

const linkClasses = "underline underline-offset-2 hover:text-ink-subtle"

// E-mail addresses, web addresses and the phone number, as the merchant writes them.
const LINKABLE =
  /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|((?:https?:\/\/|www\.)[^\s,;()]+[^\s,;().])|(\+420(?: \d{3}){3})/g

/** The shop's own address, here or on a copy of the shop (dev): a path on this site. */
function ownPath(url: string): string | null {
  const match = url.match(/^(?:https?:\/\/)?(?:www\.)?by-judith\.com(\/.*)?$/)
  if (!match) return null
  // LocalizedClientLink adds the country code itself.
  return (match[1] ?? "/").replace(/^\/(cz|sk)(?=\/|$)/, "") || "/"
}

/** The text, with its e-mail and web addresses and the phone number as links. */
function linked(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  let last = 0
  for (const match of Array.from(text.matchAll(LINKABLE))) {
    const [found, email, url, phone] = match
    const at = match.index ?? 0
    parts.push(text.slice(last, at))
    if (email) {
      parts.push(
        <a key={at} href={`mailto:${email}`} className={linkClasses}>
          {email}
        </a>
      )
    } else if (phone) {
      parts.push(
        <a key={at} href={`tel:${phone.replace(/ /g, "")}`} className={linkClasses}>
          {phone}
        </a>
      )
    } else if (url) {
      const path = ownPath(url)
      parts.push(
        path ? (
          <LocalizedClientLink key={at} href={path} className={linkClasses}>
            {url}
          </LocalizedClientLink>
        ) : (
          <a
            key={at}
            href={url.startsWith("www.") ? `https://${url}` : url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClasses}
          >
            {url}
          </a>
        )
      )
    }
    last = at + found.length
  }
  parts.push(text.slice(last))
  return parts
}

function Block({ block }: { block: LegalBlock }) {
  if (block.kind === "paragraph") {
    return <Text size="sm">{linked(block.text)}</Text>
  }
  const List = block.kind === "numbered" ? "ol" : "ul"
  return (
    <List
      className={
        block.kind === "numbered"
          ? "flex list-decimal flex-col gap-3 pl-6 text-sm leading-relaxed text-ink marker:text-ink-muted"
          : "flex list-disc flex-col gap-3 pl-6 text-sm leading-relaxed text-ink marker:text-ink-muted"
      }
    >
      {block.items.map((item, index) => (
        <li key={index} className="pl-1">
          {linked(item)}
        </li>
      ))}
    </List>
  )
}

/**
 * A merchant's legal text (terms, privacy information) as a reading page: the
 * title, the party it concerns, then its articles with numbered clauses or
 * bullets as in the original document.
 */
export default function LegalDocument({ document }: { document: LegalDocumentData }) {
  return (
    <Section spacing="md">
      <Container width="text" className="flex flex-col gap-10" data-testid="legal-document">
        <header className="flex flex-col gap-3">
          <Heading level={1} size="lg">
            {document.title}
          </Heading>
          {document.subtitle && <Text tone="subtle">{document.subtitle}</Text>}
        </header>
        {document.party && (
          <section className="flex flex-col gap-2 rounded-card bg-surface p-6" data-testid="legal-party">
            <Heading level={2} size="sm">
              {document.party.label}:
            </Heading>
            <Text size="sm">{linked(document.party.text)}</Text>
          </section>
        )}
        {document.intro.length > 0 && (
          <div className="flex flex-col gap-3">
            {document.intro.map((paragraph, index) => (
              <Text key={index} size="sm">
                {linked(paragraph)}
              </Text>
            ))}
          </div>
        )}
        {document.sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-4">
            <Heading level={2} size="md" className="border-b border-line pb-2">
              {section.title}
            </Heading>
            {section.blocks.map((block, index) => (
              <Block key={index} block={block} />
            ))}
          </section>
        ))}
        {document.closing && (
          <Text size="sm" tone="subtle" className="border-t border-line pt-6">
            {document.closing}
          </Text>
        )}
      </Container>
    </Section>
  )
}
