# By Judith design system

Tokens and components measured from the live www.by-judith.com on 2026-09-28.
Build new pages from these. Leave existing inherited components as they are until
a page is rebuilt.

Run `pnpm dev` and open `/cz/design-system` to see everything rendered. The page
returns 404 in production builds and needs no backend.

## Character

- **One typeface, one weight.** Everything is set in `quiche-sans` (Adobe Fonts kit
  `jwc1iop`) at 400. Hierarchy comes from size and whitespace. The kit has no
  500, so `font-medium` renders as regular; do not use bold for emphasis.
- **Soft and flat.** Cards, image frames, inputs and buttons use 3rem (48px)
  radii. Only floating controls such as the hotspot dot have a shadow.
- **Quiet colour.** Zinc ink on white, `#FAFAFA` panels and a warm `#E3DDC9`
  hairline. Colour accents: gold hotspots, sage links and sale prices, and a
  sand glow behind the hero photo.
- **Centred, generous sections.** `py-12` rising to `py-24` at the `small`
  breakpoint (1024px), with centred section titles.

## Tokens

`tokens.js` is the single source. `tailwind.config.js` spreads it into the theme, and
`globals.css` reads it with `theme()`. Change a value there, not in a component.

| Utility | Value | Use |
|---|---|---|
| `text-ink` / `-subtle` / `-muted` | #18181B / #52525B / #71717A | Headings and body / descriptions / captions |
| `bg-surface`, `bg-surface-hover` | #FAFAFA, #F4F4F5 | Panels, thumbnails, hovers |
| `border-line` | #E3DDC9 | Default border of every element |
| `bg-action`, `bg-action-hover` | #27272A, #3F3F46 | Primary button |
| `bg-gold` | #D7B46B | Hotspot dots, decoration only (2.0:1) |
| `text-sage` | #85977B | Large text and icons only (3.1:1) |
| `text-sage-strong` | #65775B | Sage text at body size (4.8:1) |
| `bg-cream`, `bg-greige` | #F4E7D0, #CAC8B6 | Scrollbar, quiet fills |
| `from-sand-light to-sand` | #F5EBD7 → #EBD2B4 | Hero glow |
| `text-danger`, `text-success` | #E11D48, #15803D | Status |
| `rounded-card` / `-popover` / `-chip` | 3rem / 1.4rem / 1rem | Panels / floating cards / swatches |

Breakpoints are the storefront's named ones: `xsmall` 512, `small` 1024 (the main
desktop switch), `medium` 1280, `large` 1440.

## Components

Import from `@modules/design-system`.

| Component | Purpose |
|---|---|
| `Heading` | `level` (h1–h4) sets the outline; `size` sets the look: `display`, `xl`, `lg`, `md`, `sm`. `tone="inverse"` for dark backgrounds |
| `Text` | `size`: `lead`, `base`, `sm`, `xs`; `tone`: `default`, `subtle`, `muted`, `inverse`; `as`: `p`, `span`, `div` |
| `Button` | `variant`: `primary`, `secondary`, `inverse`, `outline-inverse`; `size`: `sm`, `md`, `lg`; `isLoading`, `fullWidth`. Defaults to `type="button"` |
| `ButtonLink` | Shop navigation styled as a button (country code added) |
| `ArrowLink` | The sage "Zobrazit kolekci ↗" link |
| `Card` | Rounded panel; `tone`: `surface`, `outline`, `dark`, `glow`; `padding`: `md`, `none` |
| `Section`, `Container` | Vertical rhythm (`spacing`: `lg`, `md`, `none`) and width (`page` 1440, `content` 1280, `text` 768) with a 24px gutter |
| `MediaFrame` | Rounded, clipped image frame; `ratio`: `portrait` (11:14), `product` (29:34), `square`, `landscape` (4:3, magazine) |
| `Hotspot` | Gold breathing dot revealing a small card; hover, tap or keyboard |

All accept `className` for layout; conflicting Tailwind classes are merged, so a
passed `text-*` colour wins. Keep brand values in tokens rather than one-off
arbitrary classes.

## Building a page from a wireframe

1. Split the wireframe into horizontal bands, each a `Section`.
2. Map each heading to a `Heading` size by role (hero `display`, section title `lg`,
   card title `md`) and pick the `level` from the page outline: one `h1` per page.
3. Use `Card` for panels, `MediaFrame` for images, `Button` for actions and
   `ButtonLink` or `ArrowLink` for navigation.
4. Use the data components for commerce content: `ProductPreview` and
   `ProductPrice` apply the Omnibus sale-claim rule. Do not render prices by hand.
5. Put UI labels in `messages/cz.json` and client content (contact details,
   navigation, category texts) in `src/content/site.ts`. Content the merchant has
   not supplied is `pending("…")`. It renders as a dashed `[doplnit]` marker
   (`Placeholder`/`CopyText`) and must be replaced before production. Never
   invent numbers, reviews or offers. A link to a page that does not exist yet has
   no `href` and renders as a marker.
6. Check the page at mobile and `small`+ widths, and add a Playwright check for
   any interaction.

## Deliberate differences from the live site

- `sage-strong` replaces sage for small link and price text, which is 3.1:1 on the
  live site, below WCAG AA.
- `Hotspot` has an accessible name and works from the keyboard and on touch; the
  live hero dot works only on hover or tap, and has no accessible name.
- Headings use `font-normal` explicitly; the live Medusa `Heading` requests an
  unavailable 500 weight.
- The font stack falls back to system sans-serif if Adobe Fonts fails to load;
  before, it fell back to the browser's default serif.
