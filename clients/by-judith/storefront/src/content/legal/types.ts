/**
 * A legal text supplied by the merchant (the terms, the privacy information),
 * kept word for word. The page renders it; addresses in the text become links.
 */
export type LegalBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "bullets"; items: string[] }
  /** Numbered clauses: "odst. 4.7" in the text means article IV, clause 7. */
  | { kind: "numbered"; items: string[] }

export type LegalSection = { title: string; blocks: LegalBlock[] }

export type LegalDocument = {
  title: string
  subtitle?: string
  /** The party the text is about, set apart above it ("Prodávající: …"). */
  party?: { label: string; text: string }
  intro: string[]
  sections: LegalSection[]
  closing?: string
}
