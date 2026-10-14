# By Judith — MVP onboarding

Agreed facts and decisions for this client. Open tasks and their status live on
the [project board](https://github.com/users/kumbalek/projects/1), not here.

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
- Money S3 and invoices are merchant requirements from the audit
  (vewao-platform#15).
- Analytics: Google Analytics 4 behind the kit's cookie banner (owner decision
  2026-10-14, vewao-clients#22). It switches on, with the banner, when the
  GitHub environment variable `GA_MEASUREMENT_ID` is set; until then the shop
  sets only necessary cookies. The inherited Vercel Analytics is removed (it
  records nothing off Vercel). Measurement ID and banner/cookies-page wording
  await the merchant.

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
  Imported on local and dev. Missing procedure content is marked `[doplnit]`.
  Procedure prices (incl. "Akce … místo …") and the Ultherapy manufacturer
  claims were copied as-is and await merchant review (vewao-workspace#21).
- "Rezervovat" links to `/content/contact` until a booking provider is chosen
  (vewao-workspace#30).
- Missing site content is marked `[doplnit]` in `storefront/src/content/site.ts`
  (vewao-clients#11). Ceník and Novinky have no pages yet (vewao-clients#20).
- Values follow agreed facts, not the wireframe: free delivery from 5 000 Kč
  (wireframe: 1 500), hours from the current contact page (Po–Pá 10–18; the
  wireframe shows Po–Pá 9–19 · So 9–14).
- Not built: account, EN switch, floating contact dialog, newsletter
  (vewao-clients#21); reviews need C4 authenticity handling.

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
- Landing copy, incl. "Lasery" in the Beauty link (no imported laser
  procedure) and the composed meta description, awaits merchant review
  (vewao-workspace#21).
- The hero releases straight into the footer; the rest of screen 01 is
  vewao-clients#19.

## Access, merchant confirmations and open decisions

Tracked on the board: account ownership (vewao-workspace#12), merchant identity,
tax and Money S3 (#13), scope questions (#11), merchant review of imported
content and claims (#21), S3 media (vewao-platform#18), cookie consent
(vewao-platform#17), migration trial (vewao-platform#6) and redirects (#25).
The storefront `.env.example` contains placeholders only.

## Docker development backend

Run `bash scripts/dev-setup.sh` from this client directory, then
`cd storefront && pnpm install --frozen-lockfile && pnpm dev` using Node 22.
The setup uses the sibling `vewao-platform` repository (override with
`VEWAO_PLATFORM_DIR`), seeds local Czech/CZK settings and writes the real local
publishable key to `storefront/.env.local`. See
`vewao-platform/DEVELOPMENT.md` from the workspace root for ports,
admin creation, plugin rebuilds and provider limitations. A running Docker
engine is required.

## Order emails — Resend (2026-10-01)

The platform now implements these Czech customer notifications:

- **Objednávka přijata**: order created.
- **Objednávka zaplacena**: full payment captured, including Comgate pre-capture.
- **Objednávka odeslána**: merchant creates the PPL fulfillment, matching the
  pickup readiness action (owner decision 2026-10-01). Add tracking at this step
  if it should appear in the email; later shipment creation sends no second email.
- **Objednávka připravena k vyzvednutí**: merchant creates the clinic pickup
  fulfillment when its items are ready. Treat this as the readiness action;
  pickup shipment does not send a second email. Merchant workflow acceptance
  remains open.
- **Objednávka zrušena**: the order is canceled; the email does not claim a
  completed refund.
- **Nová objednávka ke zpracování**: staff receive one alert per created order,
  with customer details, contents, delivery method and current payment status.
  This subscriber is independent of customer email delivery.

Shipping and pickup emails list the specific fulfillment's items, so partial
fulfillment does not claim the entire order is ready. Admin notification
suppression is honored. Collecting payment on site requires recording its capture
in Medusa before the paid email is sent.

`deploy/platform.env.template` contains the client brand and seeded clinic address.
Confirm the pickup wording/opening hours before activation. Set `FEATURE_SES=false`,
`FEATURE_RESEND=true`, `RESEND_API_KEY`, a verified `RESEND_FROM` and optional
`RESEND_REPLY_TO`; set `NOTIFICATION_STAFF_EMAIL` to the staff mailbox and
`RESEND_TEST_RECIPIENT` to an owned inbox on dev. Keep the
API key outside git. The template leaves Resend off until these values are ready.

Live acceptance is tracked in vewao-workspace#19. A provider acceptance is not
proof of inbox delivery. The platform plugin README documents notification
inspection and guarded operator retries.

## Cancellation, refunds, returns and withdrawal (2026-10-06)

Draft merchant procedure for vewao-platform#16; the merchant has not accepted it yet.
Use the admin for every step, so that orders, stock and payments stay consistent.

- **Cancel before fulfilment**: *Cancel order*. Reservations are released. A
  Comgate payment is refunded in full automatically through Comgate. For pay on
  site, the order is cancelled and an already recorded payment is marked refunded:
  hand the money back at the clinic. If Comgate rejects the refund, the order stays
  open and the admin shows the error; retry later rather than refunding in the portal.
- **After fulfilment (pickup or PPL)**: an order cannot be cancelled. Create a
  return for the returned items, then *receive* it when the goods arrive; receiving
  puts them back in stock. Then refund the amount on the order's payment; for
  Comgate this sends the money back through Comgate. Shipping and partial amounts
  are entered by hand.
- **Do not refund in the Comgate portal.** Medusa cannot record that refund and
  would later try to refund again. Use the portal only to check a refund's status.
- **Withdrawal (§ 1830a)**: the footer's and order confirmation's "Odstoupit od
  smlouvy" link opens the online form. The customer gets an acknowledgment by
  e-mail and staff get an alert; statements whose order number or e-mail did not
  match are marked in the alert and must be checked. The order page in the admin
  lists the statements received for that order. Then process the return and refund
  as above.

Open before launch: merchant-approved return terms in the terms page, including
any statutory exception that applies to the goods (e.g. sealed goods unsealed after delivery for health reasons), who pays return shipping and the return
address; the acknowledgment and form copy; merchant acceptance of this procedure;
a real Comgate test-mode refund on dev.
