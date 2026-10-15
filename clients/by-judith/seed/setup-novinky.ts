import { connect, type CollectionDef } from "./content/admin-api.ts"

/**
 * Creates the "Novinky a slevy" collection that editors fill in admin → Obsah
 * (vewao-clients#20). No items: news and offers are the merchant's to write.
 * Idempotent: an existing collection keeps its items and admin changes; only
 * missing fields are added.
 */
export const NOVINKY: CollectionDef = {
  label: "Novinky a slevy",
  slug: "novinky",
  format: "md",
  fields: [
    { name: "perex", label: "Krátký text (karta)", field_type: "rich_text" },
    { name: "image", label: "Obrázek (URL)", field_type: "image" },
    { name: "image_alt", label: "Popis obrázku", field_type: "text" },
    {
      name: "odkaz",
      label: "Odkaz (cesta na webu, např. /procedury/beauty/ultherapy, nebo https://…)",
      field_type: "text",
    },
    { name: "platnost_do", label: "Platí do (včetně; prázdné = bez omezení)", field_type: "date" },
    { name: "poradi", label: "Připnout na pořadí (prázdné = podle data)", field_type: "number" },
  ],
}

await connect().ensureCollection(NOVINKY)
