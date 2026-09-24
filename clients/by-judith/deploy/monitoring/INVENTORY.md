# By Judith dev monitoring inventory

Verified read-only against the dev server on 2026-09-18 and refreshed after the
application redeploy on 2026-09-23. This file contains no credentials or customer
data.

## Host and budget

- Host: Hetzner CAX11, Ubuntu Linux/aarch64, kernel 6.8.0-84.
- Docker Engine 27.5.1 (API 1.47), Docker Compose 2.32.4.
- Memory at inspection: 3.7 GiB total, 2.6 GiB available, no swap.
- Root/Docker filesystem: 38 GiB total, 19 GiB available; 78% inodes free.
- Initial monitoring limits: Alloy 256 MiB/0.50 CPU; socket proxy 64 MiB/0.10
  CPU. Reassess after the 24-hour baseline before increasing either limit.

## Monitored targets

| Service | Current evidence | Initial check |
| --- | --- | --- |
| platform | Healthy, zero restarts/OOM; GHCR release `sha256:d105…de82` | Internal `/health`; Docker logs and state |
| storefront | Healthy; GHCR release `sha256:5b18…2955` recorded in `images.env` | Internal static `/logo.webp`; Docker logs and state |
| postgres | Healthy, zero restarts/OOM; Postgres 16.10 image | Docker logs and state |
| redis | Healthy, zero restarts/OOM; Redis 7.4.5 image | Docker logs and state |
| host | 49% disk and 22% inode use at inspection | Unix host metrics |
| Nginx Proxy Manager | Shared `npm` container; not yet collected | Exact dev-host files only in the next logging increment |

The application Compose project is `by-judith-dev` and its private network is
`by-judith-dev_default`. The current immutable image references are recorded in
`images.env` and a successful release record exists for 2026-09-18T13:18:25Z.
Image digests now identify the deployed artifacts, but Git SHAs and GitHub run
links still require the deployment-journal/workflow metadata increment.

NPM dev host IDs are 2 and 3. Their live files are under `/root/npm/data/logs/`:
`proxy-host-2_{access,error}.log` and `proxy-host-3_{access,error}.log`. Do not
mount or collect proxy-host 1 or the shared fallback/ACME logs.

## Public routes

- API: `https://judith-api-dev.vewao.link` (`/health` is the initial probe route).
- Storefront: `https://judith-dev.vewao.link`.
- Both were recorded as externally passing through Cloudflare on 2026-09-16.
  External synthetic checks still need to be created in the selected Grafana
  account; public TLS does not prove origin certificate renewal health.

## Grafana Cloud

- Stack: `https://hopefulguppy637.grafana.net/`.
- Metrics remote write: EU West 2, instance `3594774`.
- Logs ingestion: `https://logs-prod-012.grafana.net`, instance `1793059`.
- A stack-scoped token with only `metrics:write` and `logs:write` is installed in
  root-owned, Alloy-group-readable server secret files; its value is not recorded.
- Collector installed 2026-09-23 as Compose project
  `by-judith-dev-monitoring`, with no published ports.
- The required-service exporter added on 2026-09-24 queries only the private
  read-only Docker proxy and publishes no host port.
- Initial canary: 759 metric samples sent with zero failures/retries; 24 current
  log entries accepted in four HTTP 204 batches with no writer drops. Older
  bootstrap logs are deliberately dropped before ingestion.

## Required owner/account choices

These remain prerequisites for installation, not values to infer in code:

- Grafana Cloud account owner, users and verified current free quotas/retention;
  automatic paid upgrade must remain disabled.
- Write-only token owner, expiry and rotation record.
- Notification recipient/channel and dev quiet hours.
- GitHub `dev` environments and workflow activation status in both repositories.
- Cloudflare zone plan, Full (strict) confirmation and an optional zone-scoped
  analytics token. Cloudflare data does not block the core collector.
