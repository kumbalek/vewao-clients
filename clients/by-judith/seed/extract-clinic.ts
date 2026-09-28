import { writeFileSync } from "node:fs"

import {
  SITE,
  html,
  pageData,
  pause,
  sanityImage,
  slugify,
  staticQueries,
  type SanityImage,
  type SnapshotImage,
} from "./content/sanity.ts"
import {
  escapeMarkdown,
  portableTextToMarkdown,
  portableTextToParagraphs,
  portableTextToPlain,
  type Block,
} from "./magazin/portable-text.ts"

/**
 * Snapshot clinic content from bbclinic.cz into clinic.json for
 * import-clinic.ts: the O nás texts, the team, and the Akupunktura service as
 * the first procedure category with its procedures and FAQ. The other services
 * are deliberately not copied; the new procedures will differ.
 */

const SERVICE_PATH = "/tradicni-cinska-medicina" // "Akupunktura" in Naše služby
const CATEGORY_SLUG = "akupunktura"

export type SnapshotPage = {
  slug: string
  title: string
  perex: string | null
  body: string
  image: SnapshotImage | null
  gallery: SnapshotImage[]
  source_url: string
}
export type SnapshotMember = {
  slug: string
  title: string
  role: string | null
  letter: string | null
  body: string
  image: SnapshotImage | null
  order: number
  source_url: string
}
export type SnapshotCategory = {
  slug: string
  title: string
  body: string
  image: SnapshotImage | null
  order: number
  source_url: string
}
export type SnapshotProcedure = {
  slug: string
  title: string
  category: string
  body: string
  price: string | null
  price_list: { title: string; price: string }[]
  image: SnapshotImage | null
  booking_url: string | null
  order: number
  source_url: string
}
export type SnapshotFaq = { slug: string; title: string; body: string; category: string; order: number }
export type ClinicSnapshot = {
  source: string
  extracted_at: string
  pages: SnapshotPage[]
  team: SnapshotMember[]
  categories: SnapshotCategory[]
  procedures: SnapshotProcedure[]
  faq: SnapshotFaq[]
}

type AboutData = {
  about: { _rawBodyBig: Block[]; _rawBodySmall: Block[]; images: SanityImage[] }
  team: {
    nodes: { name: string; letter: string | null; subtitle: string | null; image: SanityImage | null; _rawBio: Block[] | null }[]
  }
}
type ServiceData = {
  service: {
    title: string
    mainImage: SanityImage | null
    _rawBody: Block[]
    procedures: {
      procedure: {
        _id: string
        title: string
        price: string | null
        pricelist: { title: string; price: string }[] | null
        _rawBody: Block[] | null
      }
    }[]
  }
}
type ExtendedTcm = {
  indicationTitle: string
  indications: { title: string; categories: { title: string }[] }[]
  faqs: { title: string; description: string }[]
  procedureExtentions: {
    procedure: { _id: string }
    image: SanityImage | null
    orderLink: { href: string } | null
  }[]
}

async function aboutPage(): Promise<{ page: SnapshotPage; team: SnapshotMember[] }> {
  const { about, team } = await pageData<AboutData>("/o-nas")
  // The page shows the team in a different order than its data; keep the page's.
  const shown = [...(await html("/o-nas/")).matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1].trim())
  const position = (name: string) => {
    const index = shown.indexOf(name.trim())
    return index === -1 ? shown.length : index
  }
  const [image, ...gallery] = about.images.map(sanityImage).filter((i) => i !== null)

  return {
    page: {
      slug: "o-nas",
      title: "O nás",
      perex: portableTextToPlain(about._rawBodyBig) || null,
      body: portableTextToMarkdown(about._rawBodySmall),
      image: image ?? null,
      gallery,
      source_url: `${SITE}/o-nas/`,
    },
    team: team.nodes
      .map((member) => ({
        slug: slugify(member.name),
        title: member.name.trim(),
        role: member.subtitle?.trim() || null,
        letter: member.letter?.trim() || null,
        body: portableTextToParagraphs(member._rawBio),
        image: sanityImage(member.image),
        order: position(member.name),
        source_url: `${SITE}/o-nas/`,
      }))
      .sort((a, b) => a.order - b.order)
      .map((member, order) => ({ ...member, order: order + 1 })),
  }
}

async function akupunktura() {
  const { service } = await pageData<ServiceData>(SERVICE_PATH)
  const { sanityExtendedTcm: extended } = (await staticQueries(SERVICE_PATH)) as {
    sanityExtendedTcm: ExtendedTcm
  }
  const source_url = `${SITE}${SERVICE_PATH}/`

  // "Na co se zaměřujeme?</br>S čím vám můžeme pomoci" → heading and lead line.
  const [indicationHeading, indicationLead] = extended.indicationTitle.split(/<\/?br\s*\/?>/i)
  const indications = [
    `## ${escapeMarkdown(indicationHeading)}`,
    ...(indicationLead ? [escapeMarkdown(indicationLead)] : []),
    ...extended.indications.flatMap((group) => [
      `### ${escapeMarkdown(group.title)}`,
      escapeMarkdown(group.categories.map((c) => c.title.trim()).join(", ")),
    ]),
  ]

  const category: SnapshotCategory = {
    slug: CATEGORY_SLUG,
    title: service.title.trim(),
    body: [portableTextToMarkdown(service._rawBody), ...indications].join("\n\n"),
    image: sanityImage(service.mainImage),
    order: 1,
    source_url,
  }

  const procedures: SnapshotProcedure[] = service.procedures.map(({ procedure }, index) => {
    const extension = extended.procedureExtentions.find((e) => e.procedure?._id === procedure._id)
    return {
      slug: slugify(procedure.title),
      title: procedure.title.trim(),
      category: CATEGORY_SLUG,
      body: portableTextToMarkdown(procedure._rawBody),
      price: procedure.price?.trim() || null,
      price_list: (procedure.pricelist ?? []).map((row) => ({
        title: row.title.trim(),
        price: row.price.trim(),
      })),
      image: sanityImage(extension?.image),
      booking_url: extension?.orderLink?.href ?? null,
      order: index + 1,
      source_url,
    }
  })

  const faq: SnapshotFaq[] = extended.faqs.map((item, index) => ({
    slug: `faq-${slugify(item.title)}`,
    title: item.title.trim(),
    body: item.description.trim(),
    category: CATEGORY_SLUG,
    order: index + 1,
  }))

  return { category, procedures, faq }
}

async function main() {
  const { page, team } = await aboutPage()
  await pause()
  const { category, procedures, faq } = await akupunktura()

  const snapshot: ClinicSnapshot = {
    source: SITE,
    extracted_at: new Date().toISOString().slice(0, 10),
    pages: [page],
    team,
    categories: [category],
    procedures,
    faq,
  }
  writeFileSync(new URL("./clinic.json", import.meta.url), JSON.stringify(snapshot, null, 2) + "\n")
  console.log(
    `clinic.json: 1 page, ${team.length} team members, 1 category, ${procedures.length} procedures, ${faq.length} FAQ`
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
