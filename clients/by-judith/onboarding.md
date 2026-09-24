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

## Access and decisions still needed

| Item | State |
|---|---|
| Local/test backend + CZ region + publishable key | Set up and seed; `.env.example` contains placeholders only |
| Comgate sandbox/production account ownership and callback URLs | Owner adding dev test credentials; separate dev shop connection, return URL `/cz/checkout/payment-return` |
| Actual shipping methods / pickup payment rules | Decided 2026-09-24 (above); merchant acceptance at launch |
| Gift-packaging variant mapping | Set after data import/seed |
| Tax rates, merchant identity, invoice numbering and Money S3 settings | Verify with merchant/accountant |
| Resend sender/domain, storage and required live integrations | Confirm ownership/access |
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
