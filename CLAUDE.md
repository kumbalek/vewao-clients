# vewao-clients

Client storefronts, configuration and operational notes. **The current goal is a
working By Judith shop**, with platform reuse secondary. The workspace docs and
MVP checklist define scope; the earlier fleet-first policies are superseded.

## Layout

```
clients/by-judith/
  storefront/       Next.js application, routes, forms, design and composition
  seed/             initial client data/content when needed
  onboarding.md     agreed scope, accounts, migration and deployment notes
  ...               straightforward configuration/deployment files as needed
```

The By Judith entry now exists with the copied client storefront and onboarding
notes. Backend integration and production launch remain open. A mandatory
`instance.yaml`, theme schema, encrypted YAML format or scaffold generator is not
required. Keep secrets in the deployment environment or a suitable secret store,
never plaintext in git. SOPS can be added if it helps later.

## Boundaries without a framework tax

Backend pricing, payment, tax, invoice and order logic belongs in
`vewao-platform` plugins. Do not copy or patch backend code into this repo.
Merchant values, branding, client content and storefront composition belong here.

Use the existing client Next.js app as the design baseline. Defer extraction of
its existing components. Newly implemented common components such as cookie
consent belong in the storefront kit. Reuse the kit where helpful. The client storefront
can own checkout pages/forms and call shared helpers; it does not need a universal
sealed-component API first. Keep authoritative money/order decisions on the
backend and test critical storefront flows. Extract reusable frontend logic when
it improves clarity, correctness or removes actual duplication.

A concrete requirement can be implemented in the platform even if only By Judith
uses it. Do not decline useful client work merely because a generic plugin option
does not exist. Keep client values configurable and avoid long-lived forks.

## Build and deploy

Record the client and platform revisions tested and deployed together. Consume a
published kit if available, or use a documented local package/pack workflow with
reproducible build inputs until registry publishing becomes useful. Do not deploy
a reference to an artifact that does not exist.

Mandatory synchronized semvers, schema checks, theme validators, separate soak
clients and staged fleet rollouts are deferred. A manual deploy or a small script
is acceptable. Follow `docs/PROCESSES.md` for backups, migrations, recovery and
cutover. Build/typecheck the storefront and verify agreed checkout methods.

## Client requirements

Use Czech copy, correct configured pricing/tax and the actual agreed shipping and
payment methods. Preserve required Money S3/invoice and notification workflows.
Verify applicable compliance and accessibility in the real pages rather than
assuming a token checker provides it. Content can live in client files until the
merchant needs admin editing.

The live legacy shop `bbc-ng` remains read-only. Rehearse migration with copies,
keep personal data outside git and use test credentials/email settings. Switch
production traffic only through the agreed cutover process.

## Testing and current client direction

Use **Playwright** for browser/E2E tests in this project (owner instruction,
2026-09-08). Do not introduce Cypress. Preserve the inherited client design;
new common components such as cookie consent belong in the storefront kit.
Stripe is obsolete for By Judith and must not be restored to its checkout.
Price capture runs in the new shop only; legacy collection is out of scope.
