import Image from "next/image"

import { cmsMediaUrl, listCmsNews, type CmsBlock } from "@lib/cms/client"
import { renderLexical } from "@lib/cms/lexical"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { ButtonLink, Container, Heading, MediaFrame, Section, Text } from "@modules/design-system"
import ProductPreview from "@modules/products/components/product-preview"

import EditLink from "./edit-link"

type Context = { countryCode: string; draft: boolean; edit: boolean }

/** Renders CMS page sections on the design system; editors never style them. */
export default async function CmsBlocks({ blocks, context }: { blocks: CmsBlock[]; context: Context }) {
  return (
    <>
      {blocks.map((block) => (
        <CmsBlockView key={block.id} block={block} context={context} />
      ))}
    </>
  )
}

async function CmsBlockView({ block, context }: { block: CmsBlock; context: Context }) {
  switch (block.blockType) {
    case "hero":
      return (
        <Section spacing="md">
          <Container width="content" className="grid items-center gap-8 small:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Heading level={2} size="xl">
                {block.heading}
              </Heading>
              {block.text && <Text size="lead" tone="subtle">{block.text}</Text>}
              {block.cta?.label && block.cta.href?.startsWith("/") && (
                <div>
                  <ButtonLink href={block.cta.href}>{block.cta.label}</ButtonLink>
                </div>
              )}
            </div>
            {block.image && typeof block.image === "object" && (
              <MediaFrame ratio="landscape">
                <Image src={cmsMediaUrl(block.image)} alt={block.image.alt} fill unoptimized className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
              </MediaFrame>
            )}
          </Container>
        </Section>
      )
    case "richText":
      return (
        <Section spacing="md">
          <Container width="text" className="prose-cms flex flex-col gap-4 text-ink [&_a]:underline [&_h2]:text-2xl [&_h3]:text-xl [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6">
            {renderLexical(block.content)}
          </Container>
        </Section>
      )
    case "newsList": {
      const news = await listCmsNews(block.limit ?? 3, context.draft)
      return (
        <Section spacing="md">
          <Container width="content" className="flex flex-col gap-8">
            {block.heading && <Heading level={2} size="lg" className="text-center">{block.heading}</Heading>}
            <ul className="grid gap-6 small:grid-cols-3" data-testid="cms-news">
              {news.map((item) => (
                <li key={item.id} className="flex flex-col gap-2 rounded-card bg-surface p-6">
                  <Heading level={3} size="md">{item.title}</Heading>
                  <Text tone="subtle">{item.perex}</Text>
                  {context.edit && <EditLink collection="news" id={item.id} label={`Upravit novinku ${item.title}`} />}
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )
    }
    case "productFeature": {
      const handle = typeof block.product === "object" ? block.product.handle : null
      const region = await getRegion(context.countryCode)
      const product = handle && region
        ? (await listProducts({ countryCode: context.countryCode, queryParams: { handle, limit: 1 } })).response.products[0]
        : null
      if (!product || !region) return null
      return (
        <Section spacing="md">
          <Container width="content" className="grid items-center gap-8 small:grid-cols-[1fr_2fr]">
            <ProductPreview product={product} region={region} />
            {block.note && <Text size="lead">{block.note}</Text>}
          </Container>
        </Section>
      )
    }
    default:
      return null
  }
}
