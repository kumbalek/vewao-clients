/**
 * By Judith content for the global header and footer.
 *
 * Real values come from the current contact page and the launch setup agreed on
 * 2026-09-24 (../onboarding.md). What the merchant has not supplied yet is a
 * `pending(...)` value: it renders visibly marked "[doplnit]" and must be
 * replaced before production. Pages that do not exist yet have no `href`.
 */

export type Pending = { pending: string }
export type Copy = string | Pending

export const pending = (what: string): Pending => ({ pending: what })
export const isPending = (copy: Copy): copy is Pending => typeof copy !== "string"

export const contact = {
  name: "Beauty Body Clinic",
  street: "Kosmická 19",
  city: "149 00 Praha 4 – Háje",
  phone: { label: "+420 720 980 530", href: "tel:+420720980530" },
  email: "info@bbclinic.cz",
  hours: "Po–Pá 10:00–18:00",
}

/**
 * Free PPL delivery from this item total in CZK. Must match the backend's PPL
 * price rule (FREE_DELIVERY_FROM in ../seed/seed-dev.ts); a unit test checks it.
 */
export const freeDeliveryFrom = 5000

/** "Rezervovat" leads to the contact details until a booking provider is integrated. */
export const bookingPath = "/content/contact"

export type NavLink = { label: string; href?: string }

/** A column of the header's "Procedury" menu, built from the CMS. */
export type ProcedureCategory = {
  title: string
  description: Copy
  href?: string
  procedures: { title: Copy; href?: string }[]
}

/** Top-level navigation after the two menus (Procedury, Shop). */
export const navigationLinks: NavLink[] = [
  { label: "Magazín", href: "/magazin" },
  { label: "Ceník" },
  { label: "Novinky a slevy" },
  { label: "Kontakt", href: "/content/contact" },
]

export const footer = {
  about: pending("krátký popis značky a kliniky") as Copy,
  social: pending("odkazy na sociální sítě") as Copy,
  newsletter: pending("poskytovatel newsletteru a souhlas GDPR") as Copy,
  paymentMethods: pending("loga platebních metod") as Copy,
  legal: [
    { label: "Ochrana osobních údajů", href: "/content/privacy-policy" },
    { label: "Obchodní podmínky", href: "/content/terms-of-use" },
    { label: "Cookies" },
  ] satisfies NavLink[],
}
