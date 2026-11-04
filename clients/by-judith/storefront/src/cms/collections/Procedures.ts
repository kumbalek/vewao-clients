import { APIError, type CollectionBeforeDeleteHook, type CollectionBeforeValidateHook, type CollectionConfig, type Validate, type Where } from 'payload'

import { isEditor, publishedOrPreview } from '../access/roles'
import { procedureSections } from '../blocks/sections'
import { slugField } from '../fields/preview'
import { seoField } from '../fields/seo'
import { revalidateOnDelete, revalidateOnPublish } from '../hooks/revalidate-storefront'

// The menu, the category pages, the procedures and Ceník share one list.
const tags = () => ['cms:procedures']

type Ref = number | { id: number } | null | undefined
const refId = (value: Ref) => (value && typeof value === 'object' ? value.id : value) ?? null

/** A sub-procedure takes its parent's category, so it is stored only once. */
const categoryFromParent: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  // A partial update may leave the parent out; then the stored one applies.
  const parent = data && 'parent' in data ? data.parent : originalDoc?.parent
  if (data && refId(parent)) data.category = null
  return data
}

/** One level of sub-procedures: the parent must itself be a procedure without a parent. */
const validateParent: Validate = async (value: Ref, { req, id }) => {
  const parentId = refId(value)
  if (!parentId) return true
  if (id !== undefined && parentId === Number(id)) return 'Procedura nemůže být nadřazená sama sobě.'
  const parent = await req.payload.findByID({ collection: 'procedures', id: parentId, depth: 0, draft: true, overrideAccess: true, req })
  if (refId(parent.parent as Ref)) return 'Vyberte proceduru bez nadřazené procedury: podprocedury mají jen jednu úroveň.'
  if (id !== undefined) {
    const { totalDocs } = await req.payload.count({ collection: 'procedures', where: { parent: { equals: id } }, overrideAccess: true, req })
    if (totalDocs > 0) return 'Tato procedura má vlastní podprocedury, nemůže být podprocedurou.'
  }
  return true
}

const validateCategory: Validate = (value: Ref, { siblingData }) =>
  refId(value) || refId((siblingData as { parent?: Ref }).parent) ? true : 'Vyberte kategorii, nebo nadřazenou proceduru.'

/** Deleting a procedure would leave its sub-procedures without a place in the menu. */
const keepSubProcedures: CollectionBeforeDeleteHook = async ({ req, id }) => {
  const { totalDocs } = await req.payload.count({ collection: 'procedures', where: { parent: { equals: id } }, overrideAccess: true, req })
  if (totalDocs > 0) throw new APIError('Procedura má podprocedury: nejdřív je přesuňte, nebo smažte.', 400, null, true)
}

/**
 * Procedures and their sub-procedures (#43). A procedure belongs to a
 * category; a sub-procedure (western medicine) belongs to a procedure and
 * takes its category. Prices live here, so Ceník and the procedure pages
 * never disagree.
 */
export const Procedures: CollectionConfig = {
  slug: 'procedures',
  labels: { singular: 'Procedura', plural: 'Procedury' },
  // Editors drag procedures into menu order in the list view.
  orderable: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'parent', '_status'],
    listSearchableFields: ['name', 'slug'],
    group: 'Procedury',
  },
  access: { read: publishedOrPreview, create: isEditor, update: isEditor, delete: isEditor },
  versions: { drafts: { autosave: { interval: 800 }, schedulePublish: true }, maxPerDoc: 100 },
  hooks: {
    beforeValidate: [categoryFromParent],
    beforeDelete: [keepSubProcedures],
    afterChange: [revalidateOnPublish(tags)],
    afterDelete: [revalidateOnDelete(tags)],
  },
  fields: [
    { name: 'name', label: 'Název v menu', type: 'text', required: true },
    slugField('Např. tradicni-akupunktura.'),
    {
      name: 'category',
      label: 'Kategorie',
      type: 'relationship',
      relationTo: 'procedure-categories',
      validate: validateCategory,
      admin: {
        position: 'sidebar',
        condition: (data) => !refId(data?.parent),
        description: 'Podprocedury přebírají kategorii nadřazené procedury.',
      },
    },
    {
      name: 'parent',
      label: 'Nadřazená procedura',
      type: 'relationship',
      relationTo: 'procedures',
      validate: validateParent,
      filterOptions: ({ id }) => {
        const topLevel: Where[] = [{ parent: { exists: false } }]
        return { and: id ? [...topLevel, { id: { not_equals: id } }] : topLevel }
      },
      admin: { position: 'sidebar', description: 'Jen u podprocedur, např. Modelace rtů → Injekční aplikace.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Obsah',
          fields: [
            { name: 'title', label: 'Nadpis stránky (H1)', type: 'text', admin: { description: 'Prázdné = název v menu.' } },
            { name: 'perex', label: 'Perex', type: 'textarea' },
            { name: 'image', label: 'Obrázek', type: 'upload', relationTo: 'media' },
            { name: 'sections', label: 'Obsah stránky', type: 'blocks', blocks: procedureSections },
            { name: 'ctaLabel', label: 'Text tlačítka rezervace', type: 'text', admin: { description: 'Např. Objednat se na tradiční akupunkturu. Prázdné = Rezervovat.' } },
          ],
        },
        {
          label: 'Rozcestník',
          description: 'Krátké představení na stránce kategorie, u podprocedur na stránce nadřazené procedury.',
          fields: [
            { name: 'annotation', label: 'Anotace', type: 'textarea' },
            { name: 'annotationLink', label: 'Text odkazu', type: 'text', admin: { description: 'Např. Více o vstupní diagnostice TČM →' } },
          ],
        },
        {
          label: 'Cena',
          description: 'Zobrazí se u procedury i v Ceníku. Ceny jsou volný text, např. „od 4.500 Kč“ nebo „dle doporučení“.',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'priceSummary', label: 'Cena (krátce)', type: 'text', admin: { width: '50%', description: 'Např. od 1.000 Kč' } },
                { name: 'duration', label: 'Délka', type: 'text', admin: { width: '50%', description: 'Např. 45 minut' } },
              ],
            },
            {
              name: 'priceRows',
              label: 'Ceník',
              type: 'array',
              labels: { singular: 'Řádek ceníku', plural: 'Řádky ceníku' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'item', label: 'Položka', type: 'text', admin: { width: '55%', description: 'Prázdné = cena celé procedury.' } },
                    { name: 'price', label: 'Cena', type: 'text', required: true, admin: { width: '35%' } },
                    { name: 'hidden', label: 'Skrýt', type: 'checkbox', admin: { width: '10%' } },
                  ],
                },
              ],
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
  ],
}
