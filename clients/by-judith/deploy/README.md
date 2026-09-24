# Hetzner dev deployment

This is an isolated online test shop, not the legacy shop or production cutover.
Target: CAX11 / ARM64, Docker Compose, Postgres, Redis, Medusa, Next.js and the existing Nginx Proxy Manager.
Images build in GitHub Actions; the server only pulls and runs them. All backend
plugins and admin extensions are included. Use test provider accounts only.

## One-time server setup

Server: `95.217.222.10`, SSH user `root`. The owner confirmed the old Medusa was a dev instance and authorized removal. Nginx Proxy Manager is retained. SSH key used locally:
`~/.ssh/id_ed25519-htzr`; proxy network: `npm_network`. The owner selected `vewao.link` on 2026-09-16:
API `judith-api-dev.vewao.link`, storefront `judith-dev.vewao.link`.
Do not reuse api.by-judith.com.
Do not run installation commands against a server hosting unknown applications.
Use an existing Docker Engine + Compose v2 installation or the official Docker
instructions for the server's OS. DNS A records for two dev subdomains must point
to this server. Only SSH and TCP 80/443 need inbound access; databases have no
published ports. Use Nginx Proxy Manager for HTTPS certificates. Do not install another proxy
or bind additional services to host ports 80/443.

Create `/opt/by-judith-dev`, owned by the deployment user. That user needs Docker
access (equivalent to root on this host). Install:

- This directory's `compose.yaml`.
- `vewao-platform/deploy/deploy.sh` as executable `deploy.sh`.
- `.env.template` as `.env`, `platform.env.template` as `platform.env`, and
  `images.env.template` as `images.env`; chmod all three to 600.

Set actual domains, the existing NPM Docker network name, and a random **hex**
Postgres password in `.env`. The API and storefront join the proxy network with
unique aliases; Postgres and Redis stay on the new stack's private network. Generate
separate JWT and cookie secrets in `platform.env`. Dummy provider values allow
boot only, not successful payments, labels or email. Compose supplies internal
DB/Redis URLs and public CORS origins. Keep these env files on the server only.
Compose also sets the public URL used for uploaded product images.

Authenticate the deployment user to GHCR using `docker login ghcr.io` with a
read-only packages token that can read both private repositories' images. This
credential stays on the server; GitHub Actions uses GITHUB_TOKEN for publishing.

## GitHub configuration

Create a `dev` environment in **both** repositories. For automatic deployment,
do not require manual reviewers; restrict deployment branches to `main`.

Environment variables:

| Variable | Value |
| --- | --- |
| DEPLOY_HOST | SSH hostname or IPv4 address |
| DEPLOY_USER | Deployment user, port 22 |
| MEDUSA_PUBLIC_URL | Clients repo only: `https://judith-api-dev.vewao.link` |
| STOREFRONT_URL | Clients repo only: `https://judith-dev.vewao.link` |
| MEDUSA_PUBLISHABLE_KEY | Clients repo only: key created in this dev backend |

Environment secrets in both repos:

- `DEPLOY_SSH_KEY`: dedicated key authorized for the deployment user.
- `DEPLOY_KNOWN_HOSTS`: verified SSH host key line; obtain/verify its fingerprint
  through the Hetzner console. Do not blindly trust ssh-keyscan during deployment.

Repository variable `DEPLOY_ENABLED=true` enables deployment after `main` passes.
Leave unset during initial bootstrap. Protect `main` with required CI checks.
These files are local changes until committed and pushed in their respective
repositories; no workflow or secret has been configured remotely yet.

## First boot (resolves the publishable-key dependency)

1. Push platform changes to main. CI publishes the ARM64 platform image to GHCR.
   Copy its immutable `ghcr.io/kumbalek/vewao-platform@sha256:...` reference into
   `PLATFORM_IMAGE` in `images.env`. Temporarily use that same valid reference for
   `STOREFRONT_IMAGE`; do **not** start storefront yet.
2. In `/opt/by-judith-dev`, run:

   ```sh
   docker compose --env-file .env --env-file images.env up -d --wait postgres redis
   docker compose --env-file .env --env-file images.env run --rm platform node ../../node_modules/@medusajs/cli/cli.js db:migrate
   docker compose --env-file .env --env-file images.env up -d --wait platform
   docker compose --env-file .env --env-file images.env exec platform node ../../node_modules/@medusajs/cli/cli.js user -e YOUR_EMAIL -p YOUR_LOCAL_DEV_PASSWORD
   ```

3. Add two **new** proxy hosts in NPM, without editing the old shop's hosts:
   API domain → `http://by-judith-dev-api:9000` (WebSocket support enabled),
   storefront domain → `http://by-judith-dev-storefront:8000`. Enable HTTPS and
   add `add_header X-Robots-Tag "noindex, nofollow" always;` in their Advanced
   configuration. Open `https://dev-api.your-domain/app`. In admin configure the Czech/CZK region,
   sales channel, and publishable API key linked to that channel. This instance
   runs NODE_ENV=production: the localhost-only seed intentionally refuses to run.
4. Put that publishable key and public URLs into the clients repo's `dev`
   environment variables. Push the clients changes; CI tests and publishes its
   image. Put that immutable digest into `STOREFRONT_IMAGE` and start storefront:

   ```sh
   docker compose --env-file .env --env-file images.env up -d --wait storefront
   ```

5. Verify admin login and storefront in a browser, then set repository variable
   `DEPLOY_ENABLED=true` in both repos. Subsequent successful main builds deploy
   automatically. Changes to server Compose/NPM/env files remain an explicit
   manual operation; application images deploy automatically.

## Deployment and recovery

Both workflows invoke the same server script with a component and image digest.
A server file lock serializes changes across repositories. The script pulls the
image, saves a PostgreSQL custom-format dump before backend migrations, runs
migrations explicitly, then waits for the component's health check. Successful
image pairs are recorded in `releases/`; previous pairs are preserved. Failure
fails the GitHub job and does not mark the new pair successful. A failed health
check may leave the candidate container running: inspect logs before retrying.

For application rollback, inspect the prior file in `releases/`, then call
`./deploy.sh platform OLD_DIGEST` or `./deploy.sh storefront OLD_DIGEST` after
checking schema compatibility. The script never automatically restores a database.
A migration rollback is not an image rollback. Backups remain under `backups/`;
copy them off-server and test pg_restore into an isolated database before importing
valuable data. Uploaded files are in the `uploads` volume and need separate backup.
Do not delete volumes or backup history as part of deployment.

The CAX11 has limited RAM/disk. Memory limits leave room for the OS, and builds run
elsewhere. Monitor `docker stats` and free disk; configure Docker log rotation and
remove unused images deliberately while retaining rollback revisions.

Configure the NPM dev hosts to send `X-Robots-Tag: noindex, nofollow`. This prevents indexing by compliant
crawlers; it is not access control. Use synthetic test data. HTTPS, authenticated
admin, provider sandbox setup, checkout success/failure and callback URLs must be
verified on the actual domains before real provider testing.

## Dev monitoring

The isolated Grafana Alloy collector and its runbook are in
[`monitoring/`](monitoring/README.md). It is a separate Compose project, publishes
no host ports and must not be folded into the application deployment. It was
installed on 2026-09-23 and now provides host metrics, internal probes, scoped
application logs and required-container state to Grafana Cloud. External checks
and alert notifications are intentionally deferred for dev; the production work
is tracked in [`monitoring/PRODUCTION-TODO.md`](monitoring/PRODUCTION-TODO.md).

## Recorded preparation — 2026-09-15

Files installed at `/opt/by-judith-dev` on 95.217.222.10; no new services started.
Existing NPM route: `api.by-judith.com` → `medusa_backend:9000`. The owner subsequently confirmed this was an old dev instance and authorized
removal. The new dev API must use a separate domain, not this hostname. Existing stack directory: `/root/bbc-ng-docker`.

Recovery bundle: `/root/vewao-backups/legacy-20260915T133227Z` contains a custom
Postgres dump, old Compose/NPM configuration archive and container inspection.
A temporary database restore passed with 129 public tables. The active old image
`ghcr.io/kumbalek/bbc-ng-prod:v1.17.0` and all database volumes remain. Unused
v1.16.0, v1.13.0 and v1.12.0 images were removed, leaving 22 GB free.

Both ARM64 release images built locally. Platform migration/production startup
and health/admin endpoints passed. Standalone storefront startup passed, as did
its typecheck, lint, five unit tests and six Playwright tests. Deployment script
failure-path tests passed. No commits were pushed, no GitHub secrets were set,
and no remote pipeline or new HTTPS dev host has been activated yet.

## Bootstrap progress — 2026-09-16

The isolated platform, Postgres and Redis are running healthy. Migrations and
Czech/CZK region, sales channel and publishable-key seed succeeded. The seed was
run as a one-shot process with NODE_ENV=development; the service runs production.
Old Medusa backend/worker and their database/cache containers were removed with
owner authorization; their volumes and the recovery bundle remain. NPM remains
in place. New proxy IDs 2 and 3 route the API and storefront aliases respectively.
The API health check through NPM with its new Host header returns HTTP 200.
Both DNS-only A records now resolve to the server. HTTPS issuance failed because
Let’s Encrypt and an external curl both timed out connecting to port 80. NPM
listens on 80/443, UFW permits both and Docker forwarding permits NPM traffic;
the owner has been asked to check the attached Hetzner Cloud firewall. HTTP proxy
configuration was restored after the failed challenge. GitHub setup remains pending.

The storefront is running with the actual dev URLs and publishable key baked in;
its homepage returns HTTP 200 through NPM after the initial cache-cookie redirect.
Remote bootstrap image IDs:
- Platform: `sha256:128f5422b0b1247c65cf82c6fbe882af7990020b19e843d84387dd53f0c6fef8`
- Storefront: `sha256:a7f7a3a5c829e90bec1f84cf08589f95e02d86ebd596c73b8e073f248df735ab`
The bootstrap uses locally built ARM64 images, not published GitHub revisions.

### HTTPS issued — 2026-09-16

After port 80 was allowed publicly, NPM issued certificate ID 3 for both dev
domains (expires 2026-12-15, registered for NPM renewal). HTTPS redirects are
enabled. API health, admin HTML and storefront homepage each returned HTTP 200
with normal certificate verification through NPM on the server. Port 443 remains
restricted to Cloudflare ranges; the owner must enable proxying for both DNS
records and Full (strict) SSL before external HTTPS verification. Remove the
temporary public port-80 allowance only after verifying the proxied routes and
HTTP challenge reachability for renewal. GitHub activation remains pending.

### Cloudflare verification — 2026-09-16

Both proxied HTTPS domains passed external checks: API health, admin HTML and
storefront homepage returned HTTP 200 with Cloudflare response headers. Both
HTTP ACME challenge paths served a temporary probe successfully through Cloudflare;
the probe was removed. The temporary public port-80 firewall allowance can now
be removed, retaining Cloudflare source ranges on ports 80/443. Keep SSL mode
Full (strict); this dashboard setting was not independently inspected. Admin
account setup and GitHub CI/CD activation remain pending.
