import type { Block } from 'payload'

// Content sections of procedure and category pages (content/procedury.md).
// Each maps to one storefront component, so editors fill in content and
// never style it.

/** An H2 with free text: paragraphs, lists, links. */
export const TextSection: Block = {
  slug: 'textSection',
  labels: { singular: 'Text', plural: 'Texty' },
  fields: [
    { name: 'heading', label: 'Nadpis (H2)', type: 'text' },
    { name: 'content', label: 'Text', type: 'richText', required: true },
  ],
}

/** An H2 with points: indications, benefits, steps. */
export const PointsSection: Block = {
  slug: 'pointsSection',
  labels: { singular: 'Seznam bodů', plural: 'Seznamy bodů' },
  fields: [
    { name: 'heading', label: 'Nadpis (H2)', type: 'text' },
    { name: 'intro', label: 'Úvod', type: 'textarea' },
    {
      name: 'style',
      label: 'Vzhled',
      type: 'select',
      required: true,
      defaultValue: 'headings',
      options: [
        { label: 'Body s nadpisem (H3) a textem', value: 'headings' },
        { label: 'Odrážky s tučným začátkem', value: 'labels' },
        { label: 'Číslované kroky', value: 'steps' },
      ],
    },
    {
      name: 'points',
      label: 'Body',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Bod', plural: 'Body' },
      fields: [
        { name: 'title', label: 'Nadpis bodu', type: 'text', required: true },
        { name: 'text', label: 'Text', type: 'textarea' },
      ],
    },
  ],
}

/** A preparation or device (Radiesse®, Ultherapy® Prime) with labelled points. */
export const PreparationSection: Block = {
  slug: 'preparation',
  labels: { singular: 'Preparát nebo přístroj', plural: 'Preparáty a přístroje' },
  fields: [
    { name: 'name', label: 'Název (H3)', type: 'text', required: true },
    { name: 'tagline', label: 'Podtitul', type: 'text' },
    {
      name: 'points',
      label: 'Vlastnosti',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Vlastnost', plural: 'Vlastnosti' },
      admin: { description: 'Např. Princip, Účinek, Ideální pro, Výsledek.' },
      fields: [
        { name: 'label', label: 'Popisek', type: 'text', required: true },
        { name: 'text', label: 'Text', type: 'richText', required: true },
      ],
    },
  ],
}

export const procedureSections = [TextSection, PointsSection, PreparationSection]
