import type { CollectionConfig } from 'payload'

import { editorField, hasRole, medusaField } from '../access/roles'
import { previewAdmin, shareLinkField } from '../fields/preview'
import { revalidateOnDelete, revalidateOnPublish } from '../hooks/revalidate-storefront'
import { deleteEndpoint, syncEndpoint } from '../lib/product-sync'

const tags = (doc: Record<string, unknown>) => (doc.handle ? [`cms:products:${doc.handle}`] : [])
/** The product page on the shop (Czech, the default country). */
const productPath = (handle: unknown) => `/cz/products/${String(handle ?? '')}`

/**
 * Product texts (vewao-clients#50). Medusa owns the product, its price, stock
 * and other shop properties: its sync (vewao-platform#33) creates and deletes
 * these documents and keeps the handle and title current with the `medusa`
 * API-key user. Editors write the texts, with drafts and preview.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Produkt', plural: 'Produkty' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'handle', '_status'],
    description: 'Texty produktů. Cenu, sklad, název a fotografie upravujte v administraci e-shopu (Medusa).',
    ...previewAdmin(productPath, 'handle'),
  },
  access: {
    read: ({ req }) => (hasRole(req.user, 'admin', 'editor', 'medusa') ? true : { _status: { equals: 'published' } }),
    create: ({ req }) => hasRole(req.user, 'medusa'),
    delete: ({ req }) => hasRole(req.user, 'medusa'),
    update: ({ req }) => hasRole(req.user, 'medusa', 'admin', 'editor'),
  },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 50 },
  hooks: { afterChange: [revalidateOnPublish(tags)], afterDelete: [revalidateOnDelete(tags)] },
  endpoints: [
    { path: '/medusa-sync', method: 'post', handler: syncEndpoint },
    { path: '/medusa-delete', method: 'post', handler: deleteEndpoint },
  ],
  fields: [
    { name: 'medusaId', label: 'ID v Meduse', type: 'text', required: true, unique: true, index: true, access: { update: medusaField }, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'handle', label: 'Handle', type: 'text', required: true, unique: true, index: true, access: { update: medusaField }, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'title', label: 'Název (z Medusy)', type: 'text', required: true, access: { update: medusaField }, admin: { readOnly: true } },
    shareLinkField(productPath, 'handle'),
    { name: 'subtitle', label: 'Podnadpis', type: 'textarea', access: { update: editorField }, admin: { description: 'Krátký text pod názvem produktu.' } },
    { name: 'description', label: 'Popis', type: 'richText', access: { update: editorField } },
    { name: 'dosage', label: 'Doporučené dávkování', type: 'richText', access: { update: editorField } },
    {
      name: 'ingredients',
      label: 'Složení',
      type: 'richText',
      access: { update: editorField },
      admin: { description: 'Alergeny vyznačte tučně (nařízení EU 1169/2011, čl. 21).' },
    },
    { name: 'information', label: 'Další informace', type: 'richText', access: { update: editorField }, admin: { description: 'Upozornění, skladování, hmotnost apod.' } },
  ],
}
