# By Judith storefront

The existing client Next.js design, copied into the client repo as the MVP starter.
See `../onboarding.md` for source provenance, confirmed scope and integration gaps.
Existing components remain here; new shared components belong in the storefront kit.

## Run locally

Use Node 22 (`.nvmrc`) and pnpm 10.28.0. Start the new local Medusa backend,
configure a Czech region and create a publishable API key for its sales channel.

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
# Fill in the local/test publishable key. Never use legacy production credentials.
pnpm dev
```

The storefront runs on port 8000. SDK/types are pinned to Medusa 2.20.1. Next.js
15.5.25 and stable React 19 replace the inherited floating/RC dependencies.
The Medusa UI package retains a React 18 peer declaration; this copied React 19
consumer needs its real interactive flows verified before release.

## Verify

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm exec playwright install chromium  # once, if the browser is not installed
pnpm test:e2e
```

Builds validate types and do not query a live catalogue to enumerate routes.
Set the env template values for a build; catalogue data is loaded at runtime.
The standalone Next.js output is enabled, but no production deployment is set up.

Playwright starts isolated Next.js and mock Medusa servers on ports 8101/9101.
See `e2e/README.md`. Its tests do not contact a payment gateway or place orders.
Production Medusa/payment integration remains a separate checklist item.

Stripe dependencies, wrappers, card fields and payment branches are removed.
Comgate and the existing manual payment branch remain. Analytics is disabled
until cookie consent is built in the kit. Existing legal content and promotions
are a starting point, not verified launch behaviour.
