/**
 * What a carousel slide lifts out of the diamond: one of its three tones (the
 * facets' colours sort into red, gold and green, owner 2026-11-25), or a
 * region by position. West and east follow the clinic's own story (the
 * landing hero: Západ on the left, Východ on the right).
 */
export type Region = "crown" | "west" | "heart" | "east" | "base"
export type Tone = "red" | "gold" | "green" | "neutral"
export type Highlight = { tone: Tone } | { region: Region }

export const REGIONS: Region[] = ["crown", "west", "heart", "east", "base"]

/**
 * A facet's region by its centre in the logo's SVG coordinates (156.96 x
 * 198.43, y down), along the diamond's own lines; of its 30 facets:
 * - crown, the seven above y 56;
 * - west and east, the six on each side between y 56 and 147;
 * - heart, the large middle facet and the three around the lower point;
 * - base, the outer seven of the bottom ring.
 */
export function regionOf(x: number, y: number): Region {
  if (y < 56) return "crown"
  if (y >= 147) return x >= 60 && x <= 97 && y < 170 ? "heart" : "base"
  if (x < 60) return "west"
  if (x > 97) return "east"
  return "heart"
}

/**
 * The logo's 14 colours by tone, by hue: red below 30°, gold 30–55°, green
 * above, the dark olive with the greens it sits among. White, cream and
 * greige belong to none. Of the 30 facets: red 7, gold 7, green 11.
 */
const TONES: Record<string, Tone> = {
  "#965a40": "red",
  "#cda082": "red",
  "#efd2bb": "red",
  "#7f674a": "gold",
  "#aa813a": "gold",
  "#c5a677": "gold",
  "#e6d39f": "gold",
  "#54513a": "green",
  "#78836a": "green",
  "#82967a": "green",
  "#bcbfa5": "green",
  "#ffffff": "neutral",
  "#f3e7d0": "neutral",
  "#dcd6c6": "neutral",
}

export const toneOf = (hex: string): Tone => TONES[hex.toLowerCase()] ?? "neutral"

export const highlights = (highlight: Highlight, piece: { tone: Tone; region: Region }) =>
  "tone" in highlight ? piece.tone === highlight.tone : piece.region === highlight.region
