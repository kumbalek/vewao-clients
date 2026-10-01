# By Judith — MVP onboarding

## Storefront baseline — 2026-09-08

Copied `bbc-ng/bbc-ng-storefront` from the read-only legacy repo at revision
`1fd900f6cfe19a3b32fe651957afa85ab14057d6`. The requested name `bbc-new` was not
present in the workspace; this was the matching By Judith Next.js application.
Source/copy/assets retained, with no backend code, env files, database exports,
legacy deployment workflows or repository metadata copied.

Keep the design. Extract existing components into the kit later if useful.
New common components (including cookie consent) belong in the kit. Use
Playwright for E2E testing. Capture price history in the new backend only;
no legacy price observations or fabricated historical coverage.

## Known scope

- Comgate is the card-payment integration. Stripe is obsolete and removed.
- The inherited UI supports manual payment on zero-price shipping. Confirm the
  actual pickup/shipping mapping before launch; free delivery is not proof of pickup.
- Gift packaging and quantity discounts are in the inherited UI. Reconfigure
  identifiers against new data and verify behaviour with the platform backend.
- Czech copy, legal pages, imagery and styles were retained. Legal text needs
  merchant approval/current review before launch.
- Money S3 and invoices are merchant requirements from the audit; backend
  implementation and accountant verification remain open.
- Inherited analytics is disabled until the shared consent integration is ready.

## Launch methods — decided 2026-09-24

The owner confirmed the old instance's setup for launch:

- Shipping: clinic pickup at Beauty Body Clinic (free) and PPL courier
  (150 Kč, free from 5 000 Kč), both fulfilled manually; PPL labels in the PPL
  portal. Packeta stays off.
- Payment: Comgate for every order; pay on site only with clinic pickup. Free
  PPL delivery is still paid online. No cash on delivery.
- Enforced in the storefront and at cart completion
  (`FEATURE_PAY_ON_SITE_PICKUP_ONLY`). `seed/` sets this up on local/dev.

## Wireframe v1 — 2026-09-28

`wireframe.jpg` covers 11 screens of a combined clinic and shop site. These are
beyond the launch baseline in `docs/REQUIREMENTS.md`: procedures, booking,
pricing, offers, magazine, team and account. The existing e-shop (screen 04) is
kept. The owner chose to build in steps:

- Built: global header, mobile menu and footer (screen 00), on the storefront
  design system. Product search posts to `/store?q=`.
- Built (2026-09-28): Magazín (screen 08), `/magazin` and `/magazin/<slug>`,
  served by the Content plugin. The 36 bbclinic.cz articles are imported with
  `seed/import-magazin.ts` (see `seed/README.md`): local backend, then the dev
  server on 2026-09-28 (54 records; a re-run created nothing). Its images are in
  the dev `uploads` volume. The source has no dates, authors or product links,
  so articles show none, and "Související produkty" is not built. Only 8
  articles carry categories, which become the topic filter.
- Built (2026-09-28): O nás with the team (screen 10), a procedure category
  page (02) and procedure detail (03), and the header's Procedury menu, all
  from the Content plugin. The content was copied from bbclinic.cz with
  `seed/import-clinic.ts` (see `seed/README.md`): O nás, 7 team members, and the
  Akupunktura service as the first category with 5 procedures and 5 FAQ.
  Added 2026-09-30: a Beauty category with Modelace rtů, Plastická chirurgie
  and Ultherapy® Prime, and FAQs that can belong to one procedure.
  Imported on local and dev. Marked `[doplnit]` until supplied: category menu
  perex, procedure benefits/steps/therapist, vouchers. Not built: reviews
  (needs C4 authenticity handling) and "Rezervovat u" per team member.
  Procedure prices were copied as the old site shows them, including "Akce …
  místo …" wording; the merchant should confirm them and how such claims apply
  to services. The Ultherapy text repeats manufacturer claims ("jediné …
  s FDA certifikací", "nejbezpečnější volba na trhu"); these also need the
  merchant's review.
- "Rezervovat" links to `/content/contact` until a booking provider is chosen.
- Missing content is marked `[doplnit]` in `storefront/src/content/site.ts`:
  procedures, category texts, brand text, social links, newsletter, cookies
  page and payment logos. Ceník and Novinky have no pages yet.
- Values follow agreed facts, not the wireframe: free delivery from 5 000 Kč
  (wireframe: 1 500), hours from the current contact page (Po–Pá 10–18; the
  wireframe shows Po–Pá 9–19 · So 9–14). Confirm the hours with the merchant.
- Not built: account link (the account area is disabled), EN switch, floating
  contact dialog (screen 09 B), newsletter sign-up (needs a provider and
  consent record).

## Landing page — 2026-09-30

The home page is the new landing hero: a scroll-driven frame sequence of the
lead doctor, imported from the legacy repo's `new-hp` branch (staged work on
`df902c9`). Details and frame regeneration are in
`storefront/src/modules/landing/README.md`.

- The former home page (hero, product rails, reviews, about) is now `/shop`,
  linked as "Úvod e-shopu" from the header's Shop menu.
- The logo is the new gold diamond (`logo_gold.svg`) in the site header, mobile
  menu and checkout header. Only the footer keeps the JuditH wordmark.
- The frames are from the second take (`Movie.mov`, the demo's
  `/landing-demo2`), which the owner chose as the smoother one: 11.5 MB of
  WebP. The clips stay in the legacy repo.
- Over the hero the header, service bar and mobile booking bar are
  transparent with light text, and the Procedury and Shop panels are dark and
  see-through. Past the hero they are the usual white header. The cart
  dropdown and the mobile menu stay white.
- Adapted to this site: the real header replaces the demo's mock one. The two
  category links go to `/procedury/beauty` and `/procedury/akupunktura`. The closing CTA uses the
  header's "Rezervovat" and contact page. The demo used "Objednat konzultaci"
  and a `/rezervace` page that does not exist here.
- To confirm with the merchant: the landing copy, including "Lasery" in the
  Beauty link (the imported Beauty examples have no laser procedure), and the
  home page's meta description, which is composed from the claims.
- Not built: the rest of wireframe screen 01 below the hero (service tiles,
  offers, about, statistics, reviews, products, magazine, contact). The hero
  releases straight into the footer.

## Access and decisions still needed

| Item | State |
|---|---|
| Local/test backend + CZ region + publishable key | Set up and seed; `.env.example` contains placeholders only |
| Comgate sandbox/production account ownership and callback URLs | Owner adding dev test credentials; separate dev shop connection, return URL `/cz/checkout/payment-return` |
| Actual shipping methods / pickup payment rules | Decided 2026-09-24 (above); merchant acceptance at launch |
| Gift-packaging variant mapping | Set after data import/seed |
| Tax rates, merchant identity, invoice numbering and Money S3 settings | Verify with merchant/accountant |
| Media storage | Decided 2026-09-28: S3 in production; dev keeps the Docker `uploads` volume. Choose the S3 provider/bucket and set up credentials |
| Resend sender/domain and required live integrations | Confirm ownership/access |
| Product/customer/order migration and redirects | Rehearse on copies |
| Price capture | Enable and observe in new backend; track actual start/coverage |
| Cookie consent | New shared component in storefront kit; not implemented in this starter slice |

## Integration limits

The browser fixture verifies storefront rendering and payment-session selection,
not real authorization, webhook idempotency, order creation, refund or fulfilment.
The inherited Comgate completion/redirect flow still needs to be verified against
the new provider. Do not deploy this starter as a finished shop.

## Verification — 2026-09-10

Strict typecheck and lint pass. Five unit tests and six desktop/mobile Playwright
tests pass, including keyboard payment selection and terms acknowledgement.
The copied decorative radio indicator was corrected so it no longer exposes a
second, permanently checked input. The original visual design is retained.

The homepage still contains inherited promotional copy/prices and product
references; reconcile those with the new catalogue and actual price-history
coverage before launch. The fixture tests intentionally do not validate that copy
or authorize real payments.

## Docker development backend

Run `bash scripts/dev-setup.sh` from this client directory, then
`cd storefront && pnpm install --frozen-lockfile && pnpm dev` using Node 22.
The setup uses the sibling `vewao-platform` repository (override with
`VEWAO_PLATFORM_DIR`), seeds local Czech/CZK settings and writes the real local
publishable key to `storefront/.env.local`. See
`vewao-platform/DEVELOPMENT.md` from the workspace root for ports,
admin creation, plugin rebuilds and provider limitations. A running Docker
engine is required.
