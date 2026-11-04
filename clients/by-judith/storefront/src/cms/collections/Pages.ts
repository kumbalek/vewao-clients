import type { CollectionConfig } from 'payload'

import { isEditor, publishedOrPreview } from '../access/roles'
import { pageBlocks } from '../blocks'
import { previewAdmin, shareLinkField, slugField } from '../fields/preview'
import { revalidateOnDelete, revalidateOnPublish } from '../hooks/revalidate-storefront'

const tags = (doc: Record<string, unknown>) => (doc.slug ? [`cms:pages:${doc.slug}`] : [])
// Spike: CMS pages render at /cz/cms/<slug> so they never replace live pages.
const pathFor = (slug: unknown) => `/cz/cms/${slug}`

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Stránka', plural: 'Stránky' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    ...previewAdmin(pathFor),
  },
  access: { read: publishedOrPreview, create: isEditor, update: isEditor, delete: isEditor },
  versions: {
    drafts: { autosave: { interval: 800 }, schedulePublish: true },
    maxPerDoc: 100,
  },
  hooks: { afterChange: [revalidateOnPublish(tags)], afterDelete: [revalidateOnDelete(tags)] },
  fields: [
    { name: 'title', label: 'Název', type: 'text', required: true },
    slugField('Např. o-nas. Stránka bude na /cz/cms/<slug>.'),
    shareLinkField(pathFor),
    { name: 'layout', label: 'Obsah stránky', type: 'blocks', blocks: pageBlocks },
  ],
}
