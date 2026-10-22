import type { CollectionConfig } from 'payload'

import { isEditor } from '../access/roles'
import { revalidateOnChange, revalidateOnDelete } from '../hooks/revalidate-storefront'

// Articles show their topics, so a renamed topic changes the magazine.
const tags = () => ['cms:articles']

/** Magazine topics: each article's labels and the filter above the list. */
export const Topics: CollectionConfig = {
  slug: 'topics',
  labels: { singular: 'Téma', plural: 'Témata' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'updatedAt'] },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isEditor },
  hooks: { afterChange: [revalidateOnChange(tags)], afterDelete: [revalidateOnDelete(tags)] },
  fields: [
    {
      name: 'name',
      label: 'Název',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Malými písmeny, např. „atopický ekzém“. Na webu začíná velkým písmenem; je i v adrese filtru (?tag=…).',
      },
      // One spelling per topic, so the filter and related articles match.
      hooks: { beforeValidate: [({ value }) => (typeof value === 'string' ? value.trim().toLocaleLowerCase('cs') : value)] },
    },
  ],
}
