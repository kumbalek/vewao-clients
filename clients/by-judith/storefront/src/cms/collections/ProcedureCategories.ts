import type { CollectionConfig } from 'payload'

import { isEditor, publishedOrPreview } from '../access/roles'
import { procedureSections } from '../blocks/sections'
import { previewAdmin, shareLinkField } from '../fields/preview'
import { procedurePath, procedureSlugField } from '../fields/procedure-slug'
import { seoField } from '../fields/seo'
import { revalidateOnDelete, revalidateOnPublish } from '../hooks/revalidate-storefront'

// The menu, the category pages, the procedures and Ceník share one list.
const tags = () => ['cms:procedures']

/** Východní and Západní medicína: the menu's top level and its overview pages (#43). */
export const ProcedureCategories: CollectionConfig = {
  slug: 'procedure-categories',
  labels: { singular: 'Kategorie procedur', plural: 'Kategorie procedur' },
  // Editors drag categories into menu order in the list view.
  orderable: true,
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', '_status'], group: 'Procedury', ...previewAdmin(procedurePath) },
  access: { read: publishedOrPreview, create: isEditor, update: isEditor, delete: isEditor },
  versions: { drafts: { autosave: { interval: 800 }, schedulePublish: true }, maxPerDoc: 50 },
  hooks: { afterChange: [revalidateOnPublish(tags)], afterDelete: [revalidateOnDelete(tags)] },
  fields: [
    { name: 'name', label: 'Název v menu', type: 'text', required: true },
    procedureSlugField('procedure-categories', 'Např. vychodni-medicina. Kategorie bude na /cz/<slug>.'),
    shareLinkField(procedurePath),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Obsah',
          fields: [
            { name: 'menuDescription', label: 'Krátký popis v menu', type: 'textarea' },
            { name: 'title', label: 'Nadpis stránky (H1)', type: 'text', admin: { description: 'Prázdné = název v menu.' } },
            { name: 'perex', label: 'Perex', type: 'textarea' },
            { name: 'image', label: 'Obrázek', type: 'upload', relationTo: 'media' },
            {
              name: 'sections',
              label: 'Obsah stránky',
              type: 'blocks',
              blocks: procedureSections,
              admin: { description: 'Pod obsahem následují procedury kategorie s anotacemi.' },
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
  ],
}
