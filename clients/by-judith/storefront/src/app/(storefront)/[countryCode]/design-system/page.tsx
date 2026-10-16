import { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import React from "react"

import {
  ArrowLink,
  Button,
  ButtonLink,
  Card,
  Heading,
  Hotspot,
  MediaFrame,
  Section,
  Text,
  type ButtonSize,
  type ButtonVariant,
  type CardTone,
  type HeadingSize,
  type TextSize,
} from "@modules/design-system"
import { colors } from "@modules/design-system/tokens"

// Reference page for building By Judith pages; development server only.
export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
}

const swatches = [
  { token: "ink", value: colors.ink.DEFAULT, use: "Headings and body copy · 17.7:1" },
  { token: "ink-subtle", value: colors.ink.subtle, use: "Descriptions, navigation · 7.7:1" },
  { token: "ink-muted", value: colors.ink.muted, use: "Captions, old prices · 4.8:1" },
  { token: "surface", value: colors.surface.DEFAULT, use: "Cards, thumbnails, image frames" },
  { token: "surface-hover", value: colors.surface.hover, use: "Hover on white and surface" },
  { token: "line", value: colors.line, use: "Default border of every element" },
  { token: "action", value: colors.action.DEFAULT, use: "Primary button · white text 14.9:1" },
  { token: "action-hover", value: colors.action.hover, use: "Primary button hover" },
  { token: "gold", value: colors.gold, use: "Hotspots, decoration · never text" },
  { token: "sage", value: colors.sage.DEFAULT, use: "Large text, icons · 3.1:1" },
  { token: "sage-strong", value: colors.sage.strong, use: "Links, sale prices · 4.8:1" },
  { token: "cream", value: colors.cream, use: "Scrollbar track, soft highlight" },
  { token: "greige", value: colors.greige, use: "Scrollbar thumb, quiet fills" },
  { token: "sand-light", value: colors.sand.light, use: "Hero glow, light end" },
  { token: "sand", value: colors.sand.DEFAULT, use: "Hero glow, warm end" },
  { token: "danger", value: colors.danger, use: "Errors, required markers · 4.7:1" },
  { token: "success", value: colors.success, use: "Confirmations · 5.0:1" },
]

const headings: { size: HeadingSize; spec: string; sample: string }[] = [
  {
    size: "display",
    spec: "24 → 36 → 48 px · hero claim",
    sample:
      "Objevte moudrost mistrů tradiční čínské medicíny a sílu bylin ukrytou v každé tabletě.",
  },
  { size: "xl", spec: "36 → 60 px · statement names", sample: "Judita Halvová" },
  { size: "lg", spec: "24 → 32 px · section and page titles", sample: "Naše produkty" },
  { size: "md", spec: "20 px · card titles, lead-ins", sample: "Řekla o nás" },
  { size: "sm", spec: "16 px · compact titles", sample: "Immunity" },
]

const texts: { size: TextSize; spec: string }[] = [
  { size: "lead", spec: "18 px, wide tracking · testimonials, intros" },
  { size: "base", spec: "16 px · body" },
  { size: "sm", spec: "14 px, relaxed · product descriptions" },
  { size: "xs", spec: "12 px · captions, navigation" },
]

const pangram = "Příliš žluťoučký kůň úpěl ďábelské ódy."

const lightButtons: ButtonVariant[] = ["primary", "secondary"]
const darkButtons: ButtonVariant[] = ["inverse", "outline-inverse"]
const buttonSizes: ButtonSize[] = ["sm", "md", "lg"]

const cards: { tone: CardTone; use: string }[] = [
  { tone: "surface", use: "Default content panel" },
  { tone: "outline", use: "On white where a panel needs an edge" },
  { tone: "dark", use: "Popups and emphasis" },
  { tone: "glow", use: "Warm hero background" },
]

const radii = [
  { name: "rounded-card", className: "rounded-card", value: "3rem" },
  { name: "rounded-popover", className: "rounded-popover", value: "1.4rem" },
  { name: "rounded-chip", className: "rounded-chip", value: "1rem" },
  { name: "rounded-full", className: "rounded-full", value: "pill / circle" },
]

const containers = [
  { name: "page", value: "1440 px", use: "Navigation, footer, product rails" },
  { name: "content", value: "1280 px", use: "Most sections" },
  { name: "text", value: "768 px", use: "Centred headings, reading columns" },
]

const breakpoints = [
  { name: "xsmall", value: "512 px", use: "Large phones" },
  { name: "small", value: "1024 px", use: "The desktop switch used by most layouts" },
  { name: "medium", value: "1280 px", use: "Wide desktop" },
  { name: "large", value: "1440 px", use: "Full page width, largest type step" },
]

function Block({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <Section id={id} spacing="md" aria-labelledby={`${id}-title`}>
      <Heading id={`${id}-title`} level={2} size="lg" className="mb-8">
        {title}
      </Heading>
      {children}
    </Section>
  )
}

function Label({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <Text as="span" size="xs" tone="muted" className={`block ${className ?? ""}`}>
      {children}
    </Text>
  )
}

function SpecList({
  items,
}: {
  items: { name: string; value: string; use: string }[]
}) {
  return (
    <dl className="mt-3 grid grid-cols-[auto_auto_1fr] gap-x-6 gap-y-2">
      {items.map(({ name, value, use }) => (
        <React.Fragment key={name}>
          <dt>
            <Text as="span" size="sm">
              {name}
            </Text>
          </dt>
          <dd>
            <Text as="span" size="sm" tone="muted">
              {value}
            </Text>
          </dd>
          <dd>
            <Text as="span" size="sm" tone="subtle">
              {use}
            </Text>
          </dd>
        </React.Fragment>
      ))}
    </dl>
  )
}

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") {
    notFound()
  }

  return (
    <main className="pb-24">
      <Section spacing="lg" width="text" className="text-center">
        <Label>By Judith storefront</Label>
        <Heading level={1} size="display" className="mt-2">
          Design system
        </Heading>
        <Text tone="subtle" className="mt-4">
          Tokens and components taken from www.by-judith.com. Build new pages from
          these; see src/modules/design-system/README.md.
        </Text>
      </Section>

      <Block id="colour" title="Colour">
        <ul className="grid grid-cols-2 gap-6 small:grid-cols-4">
          {swatches.map(({ token, value, use }) => (
            <li key={token}>
              <div
                className="h-20 rounded-chip border border-line"
                style={{ backgroundColor: value }}
              />
              <Text size="sm" className="mt-2">
                {token}
              </Text>
              <Label>{value}</Label>
              <Label>{use}</Label>
            </li>
          ))}
        </ul>
      </Block>

      <Block id="typography" title="Typography">
        <Text size="sm" tone="subtle" className="mb-8 max-w-3xl">
          quiche-sans (Adobe Fonts) at regular weight throughout. Emphasis comes
          from size and space, never bold. Headings set their level separately
          from their size.
        </Text>
        <div className="flex flex-col gap-10">
          {headings.map(({ size, spec, sample }) => (
            <div key={size}>
              <Label>
                Heading size=&quot;{size}&quot; · {spec}
              </Label>
              <Heading level={3} size={size} className="mt-2">
                {sample}
              </Heading>
            </div>
          ))}
          {texts.map(({ size, spec }) => (
            <div key={size}>
              <Label>
                Text size=&quot;{size}&quot; · {spec}
              </Label>
              <Text size={size} className="mt-2">
                {pangram}
              </Text>
            </div>
          ))}
          <div>
            <Label>Text tones: default · subtle · muted</Label>
            <div className="mt-2 flex flex-wrap gap-x-8">
              <Text>{pangram}</Text>
              <Text tone="subtle">{pangram}</Text>
              <Text tone="muted">{pangram}</Text>
            </div>
          </div>
          <div>
            <Label>Prices (existing ProductPrice renders the Omnibus claim)</Label>
            <div className="mt-2 flex items-baseline gap-4">
              <Text as="span" size="sm" tone="muted" className="line-through">
                1.890 Kč
              </Text>
              <Text as="span" className="text-2xl text-sage-strong">
                1.290 Kč
              </Text>
              <Text as="span" size="sm" className="text-sage-strong">
                -31 %
              </Text>
            </div>
          </div>
        </div>
      </Block>

      <Block id="buttons" title="Buttons and links">
        <div className="flex flex-col gap-8">
          {lightButtons.map((variant) => (
            <div key={variant}>
              <Label>variant=&quot;{variant}&quot; · sm · md · lg · loading · disabled</Label>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {buttonSizes.map((size) => (
                  <Button key={size} variant={variant} size={size}>
                    Přidat do košíku
                  </Button>
                ))}
                <Button variant={variant} isLoading>
                  Přidávám
                </Button>
                <Button variant={variant} disabled>
                  Vyprodáno
                </Button>
              </div>
            </div>
          ))}
          <Card tone="dark">
            <Text as="span" size="xs" tone="inverse" className="block">
              variant=&quot;inverse&quot; · variant=&quot;outline-inverse&quot; on dark
            </Text>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {darkButtons.map((variant) => (
                <Button key={variant} variant={variant}>
                  Zobrazit košík
                </Button>
              ))}
            </div>
          </Card>
          <div>
            <Label>ButtonLink (navigation) · ArrowLink</Label>
            <div className="mt-3 flex flex-wrap items-center gap-6">
              <ButtonLink href="/store" variant="secondary">
                Všechny produkty
              </ButtonLink>
              <ArrowLink href="/store">Zobrazit kolekci</ArrowLink>
            </div>
          </div>
        </div>
      </Block>

      <Block id="surfaces" title="Surfaces and shape">
        <div className="grid gap-6 small:grid-cols-2">
          {cards.map(({ tone, use }) => (
            <Card key={tone} tone={tone}>
              <Heading level={3} size="md" tone={tone === "dark" ? "inverse" : "default"}>
                Card tone=&quot;{tone}&quot;
              </Heading>
              <Text size="sm" tone={tone === "dark" ? "inverse" : "subtle"} className="mt-2">
                {use}
              </Text>
            </Card>
          ))}
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-6 small:grid-cols-4">
          {radii.map(({ name, className, value }) => (
            <li key={name}>
              <div className={`h-24 border border-line bg-surface ${className}`} />
              <Text size="sm" className="mt-2">
                {name}
              </Text>
              <Label>{value}</Label>
            </li>
          ))}
        </ul>
        <Text size="sm" tone="subtle" className="mt-6 max-w-3xl">
          Flat by design: panels have no shadow. Only floating controls such as
          the hotspot dot carry one.
        </Text>
      </Block>

      <Block id="media" title="Media and hotspots">
        <div className="grid grid-cols-2 gap-6 small:grid-cols-4">
          <div>
            <MediaFrame ratio="portrait">
              <Image src="/dn.webp" alt="" fill sizes="33vw" className="object-cover" />
            </MediaFrame>
            <Label className="mt-2">ratio=&quot;portrait&quot; (11:14) · product cards</Label>
          </div>
          <div>
            <MediaFrame ratio="product">
              <Image src="/dn.webp" alt="" fill sizes="33vw" className="object-cover" />
            </MediaFrame>
            <Label className="mt-2">ratio=&quot;product&quot; (29:34) · product gallery</Label>
          </div>
          <div>
            <MediaFrame ratio="square">
              <Image src="/dn.webp" alt="" fill sizes="33vw" className="object-cover" />
            </MediaFrame>
            <Label className="mt-2">ratio=&quot;square&quot; · cart thumbnails</Label>
          </div>
          <div>
            <MediaFrame ratio="landscape">
              <Image src="/dn.webp" alt="" fill sizes="33vw" className="object-cover" />
            </MediaFrame>
            <Label className="mt-2">ratio=&quot;landscape&quot; (4:3) · magazine</Label>
          </div>
        </div>

        <Label className="mt-10">
          Hero composition: glow card, cut-out photo and hotspots (hover, tap or
          Enter)
        </Label>
        <div className="relative mx-auto mt-4 max-w-6xl" data-testid="hotspot-demo">
          <Card tone="glow" padding="none" className="absolute inset-x-0 bottom-0 h-[58%]" />
          <Image
            src="/judit.webp"
            alt="Judita Halvová"
            width={2400}
            height={1601}
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="relative h-auto w-full"
          />
          <Hotspot label="№ 1 Allergy – podrobnosti" className="absolute left-[16%] top-[45%]">
            <Heading level={3} size="md">
              № 1 Allergy
            </Heading>
            <Text tone="muted" className="text-xl">
              1.890 Kč
            </Text>
            <ButtonLink href="/products/allergy" size="sm">
              Zobrazit
            </ButtonLink>
          </Hotspot>
        </div>
      </Block>

      <Block id="layout" title="Layout and motion">
        <div className="grid gap-10 small:grid-cols-2">
          <div>
            <Text size="sm" tone="subtle">
              Section spacing=&quot;lg&quot; is py-12 → py-24, &quot;md&quot; is
              py-8 → py-12. Container widths, each with a 24 px gutter:
            </Text>
            <SpecList items={containers} />
          </div>
          <div>
            <Text size="sm" tone="subtle">
              Breakpoints are mobile-first; use the named ones below.
            </Text>
            <SpecList items={breakpoints} />
            <Text size="sm" tone="subtle" className="mt-6">
              Motion stays quiet: 150 ms for hovers, 200 ms for buttons and
              dropdowns, 300 ms for hotspots and accordions. Looping animation
              (the breathing dot) runs only without prefers-reduced-motion.
            </Text>
          </div>
        </div>
      </Block>
    </main>
  )
}
