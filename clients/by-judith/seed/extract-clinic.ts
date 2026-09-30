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
import { landingHtmlToMarkdown } from "./content/landing-html.ts"

/**
 * Snapshot clinic content from bbclinic.cz into clinic.json for
 * import-clinic.ts: the O nás texts, the team, the Akupunktura service as a
 * procedure category with its procedures and FAQ, and a Beauty category with
 * three services as examples (Modelace rtů, Plastická chirurgie, Ultherapy®
 * Prime). The other services are deliberately not copied; the new procedures
 * will differ.
 */

const SERVICE_PATH = "/tradicni-cinska-medicina" // "Akupunktura" in Naše služby
const CATEGORY_SLUG = "akupunktura"
const BEAUTY = "beauty"

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
  source_url: string | null
}
export type SnapshotProcedure = {
  slug: string
  title: string
  category: string
  body: string
  perex: string | null
  price: string | null
  price_list: { title: string; price: string }[]
  image: SnapshotImage | null
  booking_url: string | null
  order: number
  source_url: string
}
export type SnapshotFaq = {
  slug: string
  title: string
  body: string
  category: string
  /** Empty: the whole category's question. */
  procedure: string | null
  order: number
}
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
    _rawExcerpt: Block[] | null
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
type Extension = {
  procedure: { _id: string }
  image: SanityImage | null
  orderLink: { href: string } | null
  faqs?: { title: string; description: string }[] | null
}
type PriceRow = { title: string; price: string; disabled?: boolean | null }
type PriceService = {
  title: string
  pricelist: PriceRow[] | null
  procedures: { procedure: { title: string; price: string | null; pricelist: PriceRow[] | null } }[] | null
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
      perex: null,
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
    procedure: null,
    order: index + 1,
  }))

  return { category, procedures, faq }
}

/** Rows as the old Ceník page shows them: hidden rows skipped, sub-procedures named. */
function priceRows(service: PriceService): { title: string; price: string }[] {
  const visible = (rows: PriceRow[] | null) =>
    (rows ?? []).filter((r) => !r.disabled).map((r) => ({ title: r.title.trim(), price: r.price.trim() }))
  const procedures = service.procedures ?? []
  return [
    ...visible(service.pricelist),
    ...procedures.flatMap(({ procedure }) => {
      const name = procedure.title.trim()
      const named = procedures.length > 1 && name !== service.title.trim()
      const summary = procedure.price?.trim() ? [{ title: name, price: procedure.price.trim() }] : []
      const rows = visible(procedure.pricelist).map((r) => ({ ...r, title: named ? `${name} – ${r.title}` : r.title }))
      return [...summary, ...rows]
    }),
  ]
}

/** The excerpt, unless it merely repeats the start of the body. */
function distinctPerex(excerpt: Block[] | null, body: Block[] | null): string | null {
  const perex = portableTextToPlain(excerpt)
  return perex && !portableTextToPlain(body).startsWith(perex.slice(0, 80)) ? perex : null
}

async function beauty() {
  const { pricelist } = await pageData<{ pricelist: { nodes: PriceService[] } }>("/cenik")
  const prices = (title: string) => {
    const entry = pricelist.nodes.find((s) => s.title.trim() === title.trim())
    if (!entry) throw new Error(`"${title}" is not on the Ceník page`)
    return priceRows(entry)
  }

  // The old site has no Beauty page, so the category starts without text.
  const category: SnapshotCategory = {
    slug: BEAUTY,
    title: "Beauty",
    body: "",
    image: null,
    order: 2,
    source_url: null,
  }

  await pause()
  const { service: lips } = await pageData<ServiceData>("/modelace-rtu")

  // Plastická chirurgie: two sub-procedures with photos, a booking link and FAQ.
  await pause()
  const { service: surgery } = await pageData<ServiceData>("/plasticka-chirurgie")
  const { sanityExtendedPlastika: surgeryExtra } = (await staticQueries("/plasticka-chirurgie")) as {
    sanityExtendedPlastika: { procedureExtentions: Extension[] }
  }
  const extension = (id: string) => surgeryExtra.procedureExtentions.find((e) => e.procedure?._id === id)
  const surgerySections = surgery.procedures.flatMap(({ procedure }) => {
    const photo = sanityImage(extension(procedure._id)?.image)
    return [
      `## ${escapeMarkdown(procedure.title.trim())}`,
      ...(photo ? [`![${escapeMarkdown(photo.alt ?? "")}](${photo.url})`] : []),
      portableTextToMarkdown(procedure._rawBody),
    ]
  })

  // Ultherapy® Prime lives in a page template, not in Sanity. The menu's
  // /ultherapy-prime/ is a dead link; the page is /ultherapy/. The celebrity
  // testimonial at its end is left out.
  await pause()
  const page = await html("/ultherapy/")
  const region = page.slice(page.indexOf("<h1"), page.search(/<h2[^>]*>Salma Hayek<\/h2>/))
  const ultherapy = landingHtmlToMarkdown(region, SITE)
  if (!ultherapy.markdown.includes("## Proč zvolit")) throw new Error("Ultherapy content not found")
  const [hero] = ultherapy.images
  const heroMarkdown = hero && `![${escapeMarkdown(hero.alt ?? "")}](${hero.url})`
  const blocks = ultherapy.markdown.split("\n\n").filter((block) => block !== heroMarkdown)
  const lead = blocks.find((block) => block.startsWith("### "))?.slice(4).replace(/\\(.)/g, "$1") ?? null

  const procedures: SnapshotProcedure[] = [
    {
      slug: "modelace-rtu",
      title: lips.title.trim(),
      category: BEAUTY,
      body: portableTextToMarkdown(lips._rawBody),
      perex: distinctPerex(lips._rawExcerpt, lips._rawBody),
      price: null,
      price_list: prices(lips.title),
      image: sanityImage(lips.mainImage),
      booking_url: null,
      order: 1,
      source_url: `${SITE}/modelace-rtu/`,
    },
    {
      slug: "plasticka-chirurgie",
      title: surgery.title.trim(),
      category: BEAUTY,
      body: [portableTextToMarkdown(surgery._rawBody), ...surgerySections].join("\n\n"),
      perex: distinctPerex(surgery._rawExcerpt, surgery._rawBody),
      price: null,
      price_list: prices(surgery.title),
      image: sanityImage(surgery.mainImage),
      booking_url: surgeryExtra.procedureExtentions.find((e) => e.orderLink)?.orderLink?.href ?? null,
      order: 2,
      source_url: `${SITE}/plasticka-chirurgie/`,
    },
    {
      slug: "ultherapy-prime",
      title: "Ultherapy® Prime",
      category: BEAUTY,
      body: blocks.join("\n\n"),
      perex: lead,
      price: null,
      price_list: prices("Ultherapy® Prime"),
      image: hero ? { ...hero, width: null, height: null } : null,
      booking_url: null,
      order: 3,
      source_url: `${SITE}/ultherapy/`,
    },
  ]

  const faq: SnapshotFaq[] = surgery.procedures
    .flatMap(({ procedure }) => extension(procedure._id)?.faqs ?? [])
    .map((question, index) => ({
      slug: `faq-plasticka-chirurgie-${slugify(question.title)}`,
      title: question.title.trim(),
      body: question.description.trim(),
      category: BEAUTY,
      procedure: "plasticka-chirurgie",
      order: index + 1,
    }))

  return { category, procedures, faq }
}

async function main() {
  const { page, team } = await aboutPage()
  await pause()
  const acupuncture = await akupunktura()
  await pause()
  const beautyContent = await beauty()

  const snapshot: ClinicSnapshot = {
    source: SITE,
    extracted_at: new Date().toISOString().slice(0, 10),
    pages: [page],
    team,
    categories: [acupuncture.category, beautyContent.category],
    procedures: [...acupuncture.procedures, ...beautyContent.procedures],
    faq: [...acupuncture.faq, ...beautyContent.faq],
  }
  writeFileSync(new URL("./clinic.json", import.meta.url), JSON.stringify(snapshot, null, 2) + "\n")
  console.log(
    `clinic.json: 1 page, ${team.length} team members, ${snapshot.categories.length} categories, ` +
      `${snapshot.procedures.length} procedures, ${snapshot.faq.length} FAQ`
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
