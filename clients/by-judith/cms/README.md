# By Judith content CMS (Payload) — spike

Spike for [vewao-platform#27](https://github.com/kumbalek/vewao-platform/issues/27):
does Payload give the merchant a simple draft → publish workflow with history,
rollback, shareable previews and Live Preview of the real storefront? Not
deployed and not linked from the live navigation; CMS pages render at
`/cz/cms/<slug>`.

## Run locally

Payload 3.91 needs **Next.js 16** (its peer range excludes 15.5, which the
storefront uses), so it runs as its own app rather than inside the storefront.

```sh
createdb -h localhost -p 5433 -U vewao vewao_payload_spike   # once
cp .env.example .env.local    # fill DATABASE_URL, PAYLOAD_SECRET, the two shared secrets
pnpm install && pnpm dev      # http://localhost:3100/admin
```

Storefront `.env.local`: `CMS_URL`, `NEXT_PUBLIC_CMS_URL` (both the CMS origin),
`CMS_API_KEY` (API key of a `storefront` role user), `CMS_PREVIEW_SECRET` and
`CMS_REVALIDATE_SECRET` (the same values as the CMS's `PREVIEW_SECRET` and
`STOREFRONT_REVALIDATE_SECRET`). The first admin is created at `/admin`.

## Model

| Collection | Content | Drafts / versions |
|---|---|---|
| `pages` | Title, slug and sections as blocks: Úvodní blok, Text (rich text), Novinky, Produkt | Autosave, scheduled publish, 100 versions, Live Preview, 7-day share link |
| `news` | Novinky; editors drag to order (`orderable`) | Autosave, 50 versions |
| `products` | Editorial content for Medusa products, keyed by `medusaId` and `handle` | Autosave, 50 versions |
| `media` | Images; alt text required | — |
| `users` | Roles `admin`, `editor`, and API-key integration users `medusa` and `storefront` | — |

Visitors read only published documents. The storefront reads drafts with its
`storefront` API key, server-side, and only inside a valid preview.

## How the storefront uses it

- **Published pages** are fetched per page with cache tag `cms:pages:<slug>`
  (news `cms:news`). On publish, unpublish or delete, a CMS hook calls
  `POST /api/cms/revalidate` with the shared secret, so visitors see the new
  version on the next request; a 5-minute expiry backs up a missed call.
- **Previews** are signed, expiring links (`/api/cms/preview?path&expires&mode&signature`,
  HMAC-SHA256). They enable Next.js draft mode for **that one page**:
  - `edit` links (admin Preview button, Live Preview) show "Upravit" links into the admin;
  - `view` links (the page's "Odkaz pro sdílení náhledu", 7 days) are read-only.
  - A changed path or mode breaks the signature.
- **Live Preview** loads the storefront in the admin; `RefreshRouteOnSave`
  re-renders the server components after each autosave.
- **Rich text** is rendered by our own small Lexical-to-React renderer
  (`storefront/src/lib/cms/lexical.ts`); no Payload packages in the storefront
  except `@payloadcms/live-preview-react`.

## Findings (2026-10-16)

- **Works:**
  - Visitors never see a draft. The preview sees it.
  - Publishing updates the public page immediately.
  - The version history keeps every save. Restoring an older version through `POST /api/pages/versions/:id` brought it back publicly.
  - Editors can't create or delete products or change Medusa-owned fields.
  - Share links show the draft read-only and expire. Tampered links get 401.
  - Live Preview updates while typing.
  - Drag ordering of news works.
- **Next.js versions:**
  - Payload 3.80+ excludes Next 15.5, so embedding it in the storefront (as Medusa's guide does) means upgrading the storefront to Next 16 first.
  - Running it as a separate app avoids that, at the cost of one more service.
- **`csrf` must include the CMS's own origin.** With only other origins listed, Payload rejects the admin's cookie-authenticated requests: autosave returned 403 and the editor's preferences 401.
- **The scaffolded `.env` ends without a newline after its comment.** An appended variable silently became part of the comment. Always check `.env` files end with a newline before appending to them.
- **Product sync pitfall.** If an editor has an unpublished draft open, a plain update from Medusa (no `_status`) saves on top of that draft and *unpublishes* the product content: visitors get 404. Sending `_status: published` would instead publish the editor's unreviewed draft. So:
  - Medusa should only create and delete documents, and keep `handle` current;
  - the storefront takes title, price and stock from Medusa.

  Medusa's guide doesn't mention this, because it doesn't use drafts.
- **Admin language follows the browser.** A Czech browser gets the Czech admin; field labels come from our config.
- **Not done in the spike:**
  - the Medusa-side sync module (the REST contract with the `medusa` API key was exercised directly);
  - S3 storage for media;
  - Payload migrations: dev uses schema push, production needs `payload migrate:create`;
  - deployment.
