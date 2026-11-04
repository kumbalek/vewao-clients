import type { CollectionConfig, Field } from 'payload'

import { previewUrl } from '../lib/preview-url'

/** Where a document is on the shop, from its slug, e.g. `/cz/magazin/<slug>`. */
type PathFor = (slug: unknown) => string

/** The document's address on the shop: lower-case words joined by hyphens. */
export const slugField = (description: string): Field => ({
  name: 'slug',
  label: 'Adresa (slug)',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: { position: 'sidebar', description },
  validate: (value: unknown) =>
    typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? true : 'Jen malá písmena, číslice a pomlčky.',
})

/** A read-only link that shows the current draft to someone without an account. */
export const shareLinkField = (pathFor: PathFor): Field => ({
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
})

/** Live Preview (the eye) and the Preview button open the draft with edit links. */
export const previewAdmin = (pathFor: PathFor): Pick<NonNullable<CollectionConfig['admin']>, 'livePreview' | 'preview'> => ({
  livePreview: { url: ({ data }) => previewUrl({ path: pathFor(data?.slug), edit: true, ttlSeconds: 3600 }) ?? '' },
  preview: (doc) => previewUrl({ path: pathFor(doc.slug), edit: true, ttlSeconds: 3600 }),
})
