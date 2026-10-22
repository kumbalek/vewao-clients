import type { CollectionConfig } from 'payload'

import { isEditor, publishedOrPreview } from '../access/roles'
import { previewAdmin, shareLinkField, slugField } from '../fields/preview'
import { revalidateOnDelete, revalidateOnPublish } from '../hooks/revalidate-storefront'

// The overview, related articles and each article share one list.
const tags = () => ['cms:articles']
const pathFor = (slug: unknown) => `/cz/magazin/${slug}`

/** Magazine articles at /cz/magazin/<slug> (vewao-clients#39). */
export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Článek', plural: 'Magazín' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'topics', '_status', 'updatedAt'],
    ...previewAdmin(pathFor),
  },
  // Newest first, as on the shop: the order articles were created in.
  defaultSort: '-createdAt',
  access: { read: publishedOrPreview, create: isEditor, update: isEditor, delete: isEditor },
  versions: {
    drafts: { autosave: { interval: 800 }, schedulePublish: true },
    maxPerDoc: 100,
  },
  hooks: { afterChange: [revalidateOnPublish(tags)], afterDelete: [revalidateOnDelete(tags)] },
  fields: [
    { name: 'title', label: 'Nadpis', type: 'text', required: true },
    slugField('Např. rozhovor-s-klientkou. Článek bude na /cz/magazin/<slug>.'),
    {
      name: 'publishedAt',
      label: 'Datum',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd. M. yyyy' },
        description: 'Zobrazí se u článku. Pořadí v magazínu určuje datum vytvoření.',
      },
    },
    { name: 'topics', label: 'Témata', type: 'relationship', relationTo: 'topics', hasMany: true, admin: { position: 'sidebar' } },
    shareLinkField(pathFor),
    {
      name: 'excerpt',
      label: 'Perex',
      type: 'textarea',
      admin: { description: 'Úvod pod nadpisem a text na kartě článku. Bez perexu karta ukáže začátek textu.' },
    },
    { name: 'image', label: 'Hlavní obrázek', type: 'upload', relationTo: 'media' },
    { name: 'body', label: 'Text článku', type: 'richText', required: true },
    { name: 'gallery', label: 'Galerie', type: 'upload', relationTo: 'media', hasMany: true },
    {
      name: 'sourceUrl',
      label: 'Původní adresa na bbclinic.cz',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true, condition: (data) => Boolean(data?.sourceUrl) },
    },
  ],
}
