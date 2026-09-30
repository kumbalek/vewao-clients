# By Judith dev seed

Creates the shop setup a checkout needs on a local or dev backend, through the
Admin API: tax-inclusive CZK prices, the Beauty Body Clinic stock location,
clinic pickup and PPL delivery, two collections, seven products and dev stock.
It is additive and idempotent: existing records are left alone, so re-running
it never overwrites admin edits. It refuses `by-judith.com` hosts; production
data comes from the migration.

## Run

Requires the platform seed (CZ region, `Local storefront` sales channel and
publishable key) and a secret API key from admin → Settings → Secret API Keys.

```sh
cd clients/by-judith/seed
pnpm install --frozen-lockfile
MEDUSA_BACKEND_URL=https://judith-api-dev.vewao.link \
MEDUSA_ADMIN_API_KEY=sk_... \
pnpm seed:dev
```

Set `SEED_SALES_CHANNEL` if the storefront's publishable key uses another
channel. Keep the secret key out of shell history and git; revoke it when done.

## What it sets up

| Item | Value |
| --- | --- |
| Shipping | `Pobočka Beauty Body Clinic` (pickup, free); `Přepravce PPL` (150 Kč, free from 5 000 Kč) |
| Fulfilment | Manual provider; no carrier integration |
| Payment rule | Pay on site only with clinic pickup (storefront, and backend with `FEATURE_PAY_ON_SITE_PICKUP_ONLY=true`) |
| Stock | 100 per SKU at Beauty Body Clinic (dev value, not real stock) |
| Tax | Prices are VAT-inclusive; **no tax rates** until verified with the accountant |

Launch methods were agreed with the owner on 2026-09-24. The PPL thresholds use
`lt 5000`/`gt 4999.99` because of a Medusa 2.20.1 pricing bug; see
`docs/MEDUSA-V2-NOTES.md` in the workspace.

## Magazine (Content plugin)

`magazin.json` is a snapshot of the 36 articles on www.bbclinic.cz/magazin,
taken from the site's public Gatsby page data (Sanity Portable Text, converted to
Markdown). It records the bodies, perexes, categories (as tags), image URLs,
gallery images and each article's source URL, which later redirects can use. The
source has **no publication dates or authors**; none are invented.

```sh
pnpm magazin:extract    # refresh magazin.json from bbclinic.cz (optional)
pnpm test               # Portable Text → Markdown conversion
```

`import-magazin.ts` creates the `magazin` collection (Markdown) with its fields
(perex, image, image description, source URL). It uploads each image from
Sanity's CDN into Medusa's file storage, at most 1600 px wide. Then it creates
the published articles and their tags. Like the seed it is additive: an existing
article (by slug) is left alone, and only missing tags are added. Articles are
created oldest first, so the storefront's newest-first order matches the source.
`published_at` stays empty, so no date is shown.

Put the backend URL and a secret API key in an ignored env file and run:

```sh
# .env.dev — never commit; revoke the key when done
MEDUSA_BACKEND_URL=https://judith-api-dev.vewao.link
MEDUSA_ADMIN_API_KEY=sk_...
```

```sh
node --env-file=.env.dev --experimental-strip-types import-magazin.ts
```

The storefront reads `/content/magazin/items` (published only). Edit articles in
admin → Content → Magazín.

## Clinic content (Content plugin)

`clinic.json` is a snapshot of bbclinic.cz's O nás page and its team. It also
holds the **Akupunktura** service as a procedure category with its procedures and
FAQ, and a **Beauty** category with three services as examples: Modelace rtů,
Plastická chirurgie and Ultherapy® Prime. The other services are deliberately not
copied because the new procedures will differ. `import-clinic.ts` creates these collections, all editable in admin
→ Content:

| Collection | Items | Notes |
| --- | --- | --- |
| `stranky` (Stránky) | page texts; `o-nas` | Markdown; perex, image, gallery |
| `tym` (Tým) | team members | plain text bio; role, qualification, photo, monogram letter, order |
| `kategorie-procedur` | `akupunktura`, `beauty` | Markdown intro plus "## Na co se zaměřujeme?" sections; menu perex, image, order |
| `procedury` | 5 Akupunktura and 3 Beauty procedures | Markdown; category (select), card perex, price summary, duration, price list, image, booking URL, order |
| `faq` (Časté dotazy) | 5 Akupunktura and 2 Plastická chirurgie questions | plain text answer; category (select), procedure (select; empty = whole category), order |

- **Order:** display order is the "Pořadí" field, not creation order.
- **Price list ("Ceník"):** one row per line, `Název — Cena` (em dash).
- **New categories:** add the category's slug to the "Kategorie" select in `procedury` and `faq` (collection settings), then pick it on the items.
- **Unique slugs:** the storefront's detail route finds items by slug across all collections, so slugs must be unique site-wide. Both imports check this before writing.
- **Kept but unused:** the old site's booking links are stored in `rezervace_url`. The storefront still books via the contact page.
- **Images in text:** images inside a Markdown body are uploaded with the item, and the body points at the copies.
- **Beauty sources:**
  - Prices come from the old Ceník page; rows it hides (Modelace rtů's) are left out.
  - Plastická chirurgie includes its two sub-procedures (Blefaroplastika, Chirurgická excize) as sections, and their FAQs.
  - Ultherapy® Prime's content lives in the old page template, not in Sanity. It is converted from `/ultherapy/` (the old menu's `/ultherapy-prime/` link is dead), without the celebrity testimonial.
  - The Beauty category has no text on the old site.
- **Not copied:** dates, the service's studio and before/after galleries, and procedure durations (the source has none).

```sh
pnpm clinic:extract     # refresh clinic.json from bbclinic.cz (optional)
node --env-file=.env.dev --experimental-strip-types import-clinic.ts
```

## Catalogue source

`catalogue.json` is a snapshot of the seven products in the old instance's
database backup (`legacy-20260915T133227Z`, data from September–November 2025):
titles, copy, metadata, SKUs, prices and image URLs. It contains no customer
data. Production may have changed since (for example later Digestive and Slim
products); the rehearsed migration, not this file, is the source for launch.
