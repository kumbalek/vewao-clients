import type { CollectionConfig } from 'payload'

import { isEditor, publishedOrPreview } from '../access/roles'
import { pageBlocks } from '../blocks'
import { revalidateOnDelete, revalidateOnPublish } from '../hooks/revalidate-storefront'
import { previewUrl } from '../lib/preview-url'

const tags = (doc: Record<string, unknown>) => (doc.slug ? [`cms:pages:${doc.slug}`] : [])
// Spike: CMS pages render at /cz/cms/<slug> so they never replace live pages.
const pathFor = (slug: unknown) => `/cz/cms/${slug}`

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Stránka', plural: 'Stránky' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    livePreview: { url: ({ data }) => previewUrl({ path: pathFor(data?.slug), edit: true, ttlSeconds: 3600 }) ?? '' },
    preview: (doc) => previewUrl({ path: pathFor(doc.slug), edit: true, ttlSeconds: 3600 }),
  },
  access: { read: publishedOrPreview, create: isEditor, update: isEditor, delete: isEditor },
  versions: {
    drafts: { autosave: { interval: 800 }, schedulePublish: true },
    maxPerDoc: 100,
  },
  hooks: { afterChange: [revalidateOnPublish(tags)], afterDelete: [revalidateOnDelete(tags)] },
  fields: [
    { name: 'title', label: 'Název', type: 'text', required: true },
    {
      name: 'slug',
      label: 'Adresa (slug)',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Např. o-nas. Stránka bude na /cz/cms/<slug>.' },
      validate: (value: unknown) =>
        typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? true : 'Jen malá písmena, číslice a pomlčky.',
    },
    {
      name: 'shareLink',
      label: 'Odkaz pro sdílení náhledu',
      type: 'text',
      virtual: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Platí 7 dní. Zobrazí rozpracovanou verzi bez možnosti úprav.',
      },
      hooks: {
        afterRead: [({ data }) => (data?.slug ? previewUrl({ path: pathFor(data.slug), edit: false, ttlSeconds: 7 * 24 * 3600 }) : null)],
      },
    },
    { name: 'layout', label: 'Obsah stránky', type: 'blocks', blocks: pageBlocks },
  ],
}
