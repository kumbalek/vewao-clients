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

## Catalogue source

`catalogue.json` is a snapshot of the seven products in the old instance's
database backup (`legacy-20260915T133227Z`, data from September–November 2025):
titles, copy, metadata, SKUs, prices and image URLs. It contains no customer
data. Production may have changed since (for example later Digestive and Slim
products); the rehearsed migration, not this file, is the source for launch.
