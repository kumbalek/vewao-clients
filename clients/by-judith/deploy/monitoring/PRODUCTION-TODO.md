# Production monitoring TODO

Decision recorded 2026-09-24: external synthetic checks and alert notifications
are not required for the By Judith **dev** environment. Do not expand the dev
collector merely to simulate production operations.

The following items are required before production traffic is cut over. Copy the
working dev monitoring design, but keep production labels, credentials, targets,
dashboards and notification policy separate.

## Before production cutover

- [ ] Create a production monitoring deployment with `environment="prod"` and
  production-specific least-privilege Grafana credentials. Do not reuse the dev
  write token or silently change the dev collector to point at production.
- [ ] Inventory the production Compose project, required services, domains,
  immutable images, proxy routes, host capacity and recovery owner.
- [ ] Add an internal API dependency/readiness check and a backend-aware
  storefront readiness route. Keep static liveness separate from readiness.
- [ ] Configure external checks from outside Hetzner for the public storefront
  and API through Cloudflare. Verify HTTPS, redirects, expected content and TLS
  validity. Checks must not create carts, orders or payment activity.
- [ ] Monitor the origin certificate separately; the public check sees
  Cloudflare's edge certificate, not the origin certificate.
- [ ] Create production alert rules for:
  - public endpoint failure after three consecutive checks;
  - required container missing or unhealthy for three minutes;
  - collector/host telemetry silence for five minutes;
  - low disk space and inodes (warning below 20%, critical below 10%);
  - memory below 10%, OOM events and restart loops;
  - deployment failure or running-image/release mismatch;
  - edge and origin certificate expiry (warning below 14 days, critical below 7);
  - repeated ingestion failures or projected Grafana quota usage above 80%.
- [ ] Select the production notification recipient/channel and escalation owner.
  Production outage alerts must not inherit dev quiet hours.
- [ ] Group duplicate notifications, send recovery notifications and include
  dashboard, logs and runbook links.
- [ ] Exercise a controlled failure and recovery for every critical rule. Prove
  that monitoring loss is detected outside the monitored server.
- [ ] Record the production dashboard URL, alert contact, credential owner and
  rotation procedure in the production handover.

Cloudflare analytics remains optional. External availability and monitoring-loss
alerts are not optional for production because an on-server collector cannot
report when its host or network is completely unavailable.

## Done when

The owner receives a tested production failure and recovery notification, the
dashboard distinguishes application, host, edge and stale-telemetry failures,
and the cutover checklist links to the production dashboard and recovery runbook.
