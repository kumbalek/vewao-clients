/**
 * By Judith design tokens, measured from the live www.by-judith.com on
 * 2026-09-28. The single source for tailwind.config.js, globals.css (through
 * Tailwind's theme()) and the /design-system page. CommonJS so the Tailwind
 * config can require it.
 *
 * Contrast ratios are WCAG 2 against white. Anything below 4.5:1 must not carry
 * body-size text.
 */

const colors = {
  // Text. Zinc, as rendered by the Medusa UI preset the site was built on.
  ink: {
    DEFAULT: "#18181B", // 17.7:1: headings, body copy
    subtle: "#52525B", // 7.7:1: descriptions, navigation
    muted: "#71717A", // 4.8:1: captions, reference (struck-through) prices
  },
  // Backgrounds and edges. The page itself is white.
  surface: {
    DEFAULT: "#FAFAFA", // cards, product thumbnails, image frames
    hover: "#F4F4F5",
  },
  line: "#E3DDC9", // warm default border for every element
  // Primary action: the dark pill ("Přidat do košíku").
  action: {
    DEFAULT: "#27272A", // white text 14.9:1
    hover: "#3F3F46",
  },
  // Brand accents.
  gold: "#D7B46B", // 2.0:1: hotspot dots and decoration only, never text
  sage: {
    DEFAULT: "#85977B", // 3.1:1: large text, icons, decoration
    strong: "#65775B", // 4.8:1: sage text at body size (links, sale prices)
  },
  cream: "#F4E7D0", // scrollbar track, soft highlight
  greige: "#CAC8B6", // scrollbar thumb, quiet fills
  sand: {
    light: "#F5EBD7", // light end of the hero glow
    DEFAULT: "#EBD2B4", // warm end of the hero glow
  },
  // Status.
  danger: "#E11D48", // 4.7:1: errors, required markers
  success: "#15803D", // 5.0:1: confirmations
}

const borderRadius = {
  card: "3rem", // cards, image frames, inputs; pills at button height
  popover: "1.4rem", // hotspot and small floating panels
  chip: "1rem",
}

const fontFamily = {
  // Adobe Fonts kit jwc1iop (loaded in app/layout.tsx): weights 100, 300,
  // 400 and 700. There is no 500, so "medium" renders as 400.
  sans: ["quiche-sans", "ui-sans-serif", "system-ui", "sans-serif"],
}

module.exports = { colors, borderRadius, fontFamily }
