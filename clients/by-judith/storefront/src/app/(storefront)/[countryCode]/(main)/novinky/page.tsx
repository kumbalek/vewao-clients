import { Metadata } from "next"

import { listNews, listSaleProducts } from "@lib/data/novinky"
import { getRegion } from "@lib/data/regions"
import { Heading, Section, Text } from "@modules/design-system"
import NewsCard from "@modules/novinky/components/news-card"
import ProductPreview from "@modules/products/components/product-preview"

export const metadata: Metadata = {
  title: "Novinky a slevy",
  description: "Novinky a aktuální nabídky kliniky a e-shopu By Judith.",
}

type Props = { params: Promise<{ countryCode: string }> }

/**
 * News and offers (vewao-clients#20): posts editors write in admin → Obsah →
 * Novinky a slevy, and the shop's products currently on sale, with the same
 * Omnibus-correct prices as the shop.
 */
export default async function NewsPage({ params }: Props) {
  const { countryCode } = await params
  const [posts, region, saleProducts] = await Promise.all([
    listNews(),
    getRegion(countryCode),
    listSaleProducts(countryCode).catch(() => []),
  ])

  return (
    <>
      <Section spacing="md" className="pb-0 small:pb-0">
        <Heading level={1} size="display">
          Novinky a slevy
        </Heading>
        <Text tone="subtle" className="mt-3">
          Co je u nás nového a co právě nabízíme.
        </Text>
      </Section>

      <Section spacing="md" aria-labelledby="novinky-posts">
        <Heading id="novinky-posts" level={2} size="md" className="sr-only">
          Novinky
        </Heading>
        {posts.length > 0 ? (
          <ul className="grid gap-x-6 gap-y-12 xsmall:grid-cols-2 small:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <NewsCard post={post} />
              </li>
            ))}
          </ul>
        ) : (
          <Text tone="subtle" data-testid="news-empty">
            Momentálně nemáme žádné novinky. Zkuste to brzy znovu.
          </Text>
        )}
      </Section>

      {region && saleProducts.length > 0 && (
        <Section spacing="lg" aria-labelledby="novinky-sale">
          <Heading id="novinky-sale" level={2} size="md" className="mb-8">
            Zlevněné produkty
          </Heading>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-8 small:grid-cols-3" data-testid="sale-products">
            {saleProducts.map((product) => (
              <li key={product.id}>
                <ProductPreview product={product} region={region} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )
}
