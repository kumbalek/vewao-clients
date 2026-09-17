# Browser tests

Playwright is the project E2E runner, per the owner's instruction. Run `pnpm test:e2e`.
The config starts isolated local Next.js and mock Medusa servers on ports 8101 and
9101. It never forwards to a production backend. Do not reuse a running live app.

Tests cover the retained Czech homepage, Comgate selection/session initiation,
keyboard selection/terms acknowledgement, exclusion of obsolete providers and the inherited manual payment option on zero-price
shipping. Desktop and mobile screenshots/traces land in ignored test output.
The fixture cannot complete orders. These are storefront contract tests, not proof
of actual Comgate authorization/callbacks, fulfilment or price-history persistence.
Those require the real new backend and sandbox integration tests before launch.
