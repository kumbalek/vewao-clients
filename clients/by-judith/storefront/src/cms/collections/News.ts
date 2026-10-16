import type { CollectionConfig } from 'payload'

import { isEditor, publishedOrPreview } from '../access/roles'
import { revalidateOnDelete, revalidateOnPublish } from '../hooks/revalidate-storefront'

const tags = () => ['cms:news']

export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'Novinka', plural: 'Novinky' },
  // Editors drag items into order in the list view.
  orderable: true,
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'validUntil', '_status'] },
  access: { read: publishedOrPreview, create: isEditor, update: isEditor, delete: isEditor },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 50 },
  hooks: { afterChange: [revalidateOnPublish(tags)], afterDelete: [revalidateOnDelete(tags)] },
  fields: [
    { name: 'title', label: 'Nadpis', type: 'text', required: true },
    { name: 'perex', label: 'Krátký text', type: 'textarea', required: true },
    { name: 'image', label: 'Obrázek', type: 'upload', relationTo: 'media' },
    { name: 'href', label: 'Odkaz „Více informací“', type: 'text' },
    { name: 'validUntil', label: 'Platí do', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
  ],
}
