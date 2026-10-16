import type { Block } from 'payload'

// Page sections. Each maps to one storefront component built on the design
// system, so editors fill in content and never style it.

export const Hero: Block = {
  slug: 'hero',
  labels: { singular: 'Úvodní blok', plural: 'Úvodní bloky' },
  fields: [
    { name: 'heading', label: 'Nadpis', type: 'text', required: true },
    { name: 'text', label: 'Text', type: 'textarea' },
    { name: 'image', label: 'Obrázek', type: 'upload', relationTo: 'media' },
    {
      name: 'cta',
      label: 'Tlačítko',
      type: 'group',
      fields: [
        { name: 'label', label: 'Text tlačítka', type: 'text' },
        { name: 'href', label: 'Odkaz (např. /store)', type: 'text' },
      ],
    },
  ],
}

export const RichText: Block = {
  slug: 'richText',
  labels: { singular: 'Text', plural: 'Texty' },
  fields: [{ name: 'content', label: 'Obsah', type: 'richText', required: true }],
}

export const NewsList: Block = {
  slug: 'newsList',
  labels: { singular: 'Novinky', plural: 'Novinky' },
  fields: [
    { name: 'heading', label: 'Nadpis', type: 'text', defaultValue: 'Novinky a slevy' },
    { name: 'limit', label: 'Počet novinek', type: 'number', defaultValue: 3, min: 1, max: 12 },
  ],
}

export const ProductFeature: Block = {
  slug: 'productFeature',
  labels: { singular: 'Produkt', plural: 'Produkty' },
  fields: [
    { name: 'product', label: 'Produkt', type: 'relationship', relationTo: 'products', required: true },
    { name: 'note', label: 'Doprovodný text', type: 'textarea' },
  ],
}

export const pageBlocks = [Hero, RichText, NewsList, ProductFeature]
