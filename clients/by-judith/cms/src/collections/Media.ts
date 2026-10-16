import type { CollectionConfig } from 'payload'

import { isEditor } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Obrázek', plural: 'Obrázky' },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isEditor },
  fields: [
    // Required: every image on the site needs a text alternative.
    { name: 'alt', label: 'Popis obrázku (alt)', type: 'text', required: true },
  ],
  upload: { mimeTypes: ['image/*'] },
}
