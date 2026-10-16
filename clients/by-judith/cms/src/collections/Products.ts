import type { CollectionConfig } from 'payload'

import { editorField, hasRole, medusaField } from '../access/roles'
import { revalidateOnPublish } from '../hooks/revalidate-storefront'

const tags = (doc: Record<string, unknown>) => (doc.handle ? [`cms:products:${doc.handle}`] : [])

/**
 * Editorial content for Medusa products. Medusa owns the product: its sync
 * creates, renames and deletes these documents with the `medusa` API key
 * user; editors only write the content fields, with drafts.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Produkt', plural: 'Produkty' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'handle', '_status'] },
  access: {
    read: ({ req }) => (hasRole(req.user, 'admin', 'editor', 'storefront', 'medusa') ? true : { _status: { equals: 'published' } }),
    create: ({ req }) => hasRole(req.user, 'medusa'),
    delete: ({ req }) => hasRole(req.user, 'medusa'),
    update: ({ req }) => hasRole(req.user, 'medusa', 'admin', 'editor'),
  },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 50 },
  hooks: { afterChange: [revalidateOnPublish(tags)] },
  fields: [
    { name: 'medusaId', label: 'ID v Meduse', type: 'text', required: true, unique: true, index: true, access: { update: medusaField }, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'handle', label: 'Handle', type: 'text', required: true, unique: true, index: true, access: { update: medusaField }, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'title', label: 'Název (z Medusy)', type: 'text', required: true, access: { update: medusaField }, admin: { readOnly: true } },
    { name: 'description', label: 'Popis', type: 'richText', access: { update: editorField } },
    { name: 'dosage', label: 'Doporučené dávkování', type: 'richText', access: { update: editorField } },
  ],
}
