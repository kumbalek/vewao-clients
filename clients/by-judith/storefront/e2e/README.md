# Browser tests

Playwright is the project E2E runner, per the owner's instruction. Run `pnpm test:e2e`.
The config starts isolated local Next.js and mock Medusa servers on ports 8101 and
9101. It never forwards to a production backend. Do not reuse a running live app.

Tests cover the retained Czech homepage, noindex headers, Comgate selection and
session initiation, keyboard selection/terms acknowledgement, exclusion of
obsolete providers, and pay-on-site offered only with clinic pickup (not with
free PPL delivery).

The mock also plays the Comgate gateway on `localhost`, a different site from
the storefront on `127.0.0.1`, and emulates Medusa's cart completion. The
customer leaves the fake gateway by clicking, so the return is a cross-site
navigation as with Comgate; this checks that the cart cookie survives it. Flows
covered: paid (order confirmed, cart cleared), cancelled (back to payment with
the cart kept), pending (no success claim, then a successful re-check), and a
crafted return link that must not complete a pay-on-site cart.

These are storefront contract tests. They do not prove real Comgate
authorization, webhooks, fulfilment or price-history persistence; verify those
against the dev backend with Comgate test mode before launch.
