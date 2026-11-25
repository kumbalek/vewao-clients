import type { CollectionConfig } from 'payload'

import { isEditor } from '../access/roles'
import { revalidateOnChange, revalidateOnDelete } from '../hooks/revalidate-storefront'

const tags = () => ['cms:sales']

/**
 * Sale labels (owner, 2026-11-22): the texts the shop shows for a sale on
 * category and product pages and in the cart. A label shows only while the
 * sale with its code runs in the e-shop administration (vewao-platform#49).
 */
export const Sales: CollectionConfig = {
  slug: 'sales',
  labels: { singular: 'Akce', plural: 'Akce' },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'code', 'updatedAt'],
    description: 'Štítek se na webu ukáže jen po dobu, kdy akce s tímto kódem běží v administraci e-shopu.',
  },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isEditor },
  hooks: { afterChange: [revalidateOnChange(tags)], afterDelete: [revalidateOnDelete(tags)] },
  fields: [
    {
      name: 'code',
      label: 'Kód akce',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Kód promoakce v administraci e-shopu (např. VANOCE-HERBS-2PLUS1), nebo název cenového seznamu (např. Vánoční ceny).',
      },
      hooks: { beforeValidate: [({ value }) => (typeof value === 'string' ? value.trim() : value)] },
    },
    {
      name: 'label',
      label: 'Štítek',
      type: 'text',
      required: true,
      admin: { description: 'Krátce a výrazně, např. „2 + 1 ZDARMA“.' },
    },
    {
      name: 'description',
      label: 'Popis',
      type: 'textarea',
      admin: { description: 'Jedna až dvě věty pod štítkem.' },
    },
    {
      name: 'categories',
      label: 'Kategorie',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Adresy kategorií, kde se akce ukáže (např. herbs). Platí i pro jejich podkategorie a produkty v nich.',
      },
    },
    {
      name: 'showInCart',
      label: 'Ukázat v košíku',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'V sekci „Aktivní slevy“, když se akce na košík uplatní.' },
    },
  ],
}
