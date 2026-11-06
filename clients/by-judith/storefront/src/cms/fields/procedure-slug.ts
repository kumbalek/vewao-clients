import type { TextField } from 'payload'

import { RESERVED_SLUGS } from '../lib/reserved-slugs'
import { slugFormat } from './preview'

type SlugCollection = 'procedure-categories' | 'procedures'

/** Where categories, procedures and sub-procedures are on the shop: one flat level. */
export const procedurePath = (slug: unknown) => `/cz/${slug}`

/**
 * Categories and procedures share /cz/<slug>: a slug must be free in both
 * collections and must not be a shop page (cenik, magazin, …).
 */
export function procedureSlugField(own: SlugCollection, description: string): TextField {
  const other: SlugCollection = own === 'procedures' ? 'procedure-categories' : 'procedures'
  return {
    name: 'slug',
    label: 'Adresa (slug)',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: { position: 'sidebar', description },
    validate: async (value, { req }) => {
      const format = slugFormat(value)
      if (format !== true) return format
      if (RESERVED_SLUGS.includes(value as string)) return `Adresa /${value} patří jiné stránce webu.`
      const { totalDocs } = await req.payload.count({
        collection: other,
        where: { slug: { equals: value } },
        overrideAccess: true,
        req,
      })
      return totalDocs > 0 ? `Adresu /${value} už má ${other === 'procedures' ? 'procedura' : 'kategorie'}.` : true
    },
  }
}
