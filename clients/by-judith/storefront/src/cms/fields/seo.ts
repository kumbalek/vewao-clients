import type { Field } from 'payload'

/** Search-engine texts; empty ones fall back to the page's own heading and perex. */
export const seoField: Field = {
  name: 'seo',
  label: 'SEO',
  type: 'group',
  fields: [
    { name: 'title', label: 'Meta title', type: 'text', admin: { description: 'Nejvýš kolem 60 znaků. Prázdné = nadpis stránky.' } },
    { name: 'description', label: 'Meta description', type: 'textarea', admin: { description: 'Nejvýš kolem 155 znaků. Prázdné = perex.' } },
    { name: 'keywords', label: 'Klíčová slova', type: 'textarea', admin: { description: 'Podklad pro SEO od copywritera; na web se nevypisují.' } },
  ],
}
