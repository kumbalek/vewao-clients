import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCmsPage, previewGrantFor } from "@lib/cms/client"
import { Container, Heading, Section } from "@modules/design-system"
import CmsBlocks from "@modules/cms/components/blocks"
import EditLink from "@modules/cms/components/edit-link"
import PreviewBar from "@modules/cms/components/preview-bar"

type Props = { params: Promise<{ countryCode: string; slug: string }> }

// Spike (vewao-platform#27): pages from the Payload CMS, outside the live navigation.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function CmsPage({ params }: Props) {
  const { countryCode, slug } = await params
  const path = `/${countryCode}/cms/${slug}`
  const grant = await previewGrantFor(path)
  const page = await getCmsPage(slug, Boolean(grant)).catch(() => null)
  if (!page) notFound()
  const edit = grant?.mode === "edit"

  return (
    <>
      <Section spacing="md" className="pb-0">
        <Container width="content" className="flex flex-wrap items-center gap-4">
          <Heading level={1} size="lg">
            {page.title}
          </Heading>
          {edit && <EditLink collection="pages" id={page.id} label={`Upravit stránku ${page.title}`} />}
        </Container>
      </Section>
      <CmsBlocks blocks={page.layout ?? []} context={{ countryCode, draft: Boolean(grant), edit }} />
      {grant && <PreviewBar path={path} pageId={page.id} edit={edit} />}
    </>
  )
}
