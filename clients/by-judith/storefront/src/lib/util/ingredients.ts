/** A run of ingredient text; `allergen` runs must be emphasised (Regulation (EU) 1169/2011, Art. 21(1)(b)). */
export type IngredientSegment = { text: string; allergen: boolean }

/**
 * The product's `metadata.ingredients`: a JSON array of strings, as the legacy
 * shop stored it, or plain text with one ingredient per line. Allergens listed
 * in Annex II are marked in the admin as `**hořčice**`.
 */
export function parseIngredients(raw: unknown): IngredientSegment[][] {
  if (typeof raw !== "string" || !raw.trim()) return []
  let lines: string[]
  try {
    const parsed: unknown = JSON.parse(raw)
    lines = Array.isArray(parsed) ? parsed.map(String) : [String(parsed)]
  } catch {
    // Hand-edited metadata must not take the product page down.
    lines = raw.split("\n")
  }
  return lines.map((line) => line.trim()).filter(Boolean).map(splitAllergens)
}

function splitAllergens(line: string): IngredientSegment[] {
  const segments: IngredientSegment[] = []
  const pattern = /\*\*(.+?)\*\*/g
  let last = 0
  for (let match = pattern.exec(line); match; match = pattern.exec(line)) {
    if (match.index > last) segments.push({ text: line.slice(last, match.index), allergen: false })
    segments.push({ text: match[1]!, allergen: true })
    last = match.index + match[0].length
  }
  if (last < line.length) segments.push({ text: line.slice(last), allergen: false })
  return segments
}
