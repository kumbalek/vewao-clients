# By Judith dev monitoring

This is an isolated, private collector for the deployed dev shop. It sends host
metrics, internal availability probes and only the `by-judith-dev` Compose
project's Docker logs to Grafana Cloud. It publishes no host ports and does not
run Grafana, Loki or Prometheus storage on Hetzner.

The initial collector was installed on 2026-09-23. The dashboard export is in
`dashboards/`; it displays verified status, logs, host capacity, required-service
state, restarts, OOM state and actual running image references. This increment
intentionally does **not** collect shared NPM access logs or claim deployment-run
coverage. Those need the next logging/journal work.

## Prepare

1. Create/select the owner-controlled Grafana Cloud EU stack and verify its
   quotas, retention and billing controls.
2. Create a least-privilege access policy that can only write metrics and logs.
3. Copy this directory to `/opt/by-judith-dev-monitoring` on the server.
4. Copy `.env.template` to `.env` and fill in the stack URLs and instance IDs.
5. Create the two token files described in `secrets/README.md`, then run:

   ```sh
   chmod 600 .env
   chown root:473 secrets/grafana-metrics-password secrets/grafana-logs-password
   chmod 640 secrets/grafana-metrics-password secrets/grafana-logs-password
   docker compose config --quiet
   docker compose up -d --wait
   ```

Do not add Grafana credentials to the application `.env`, GitHub workflow output,
shell history or Compose command line. Do not publish Alloy's HTTP UI or the
socket proxy port.

## Verify the canary

In Grafana Explore, verify within one minute:

- `node_uname_info{client="by-judith",environment="dev"}` exists;
- `probe_success{scope="internal"}` has distinct platform/storefront series;
- a harmless canary written to a target container appears with its `service`;
- logs from an unrelated container do not appear;
- no value matching the synthetic secret canary appears.

Restart only the collector and confirm the named `alloy-data` volume is retained:

```sh
docker compose restart alloy
docker compose ps
```

Then block outbound ingestion briefly, restore it, and record observed lag/loss.
Docker's existing three-by-10-MiB rotation remains the hard upstream buffer.

## Verify required-service state

The standard-library-only exporter queries the private socket proxy and emits
bounded metrics for `platform`, `storefront`, `postgres` and `redis`. It never
mounts the Docker socket. Verify these queries after installation:

```promql
vewao_container_present{client="by-judith", environment="dev"}
vewao_container_health_status{client="by-judith", environment="dev", status="healthy"}
vewao_container_info{client="by-judith", environment="dev"}
vewao_container_state_scrape_success{client="by-judith", environment="dev"}
```

All four services must emit a presence series even when absent. An unavailable
Docker API omits service state rather than falsely reporting every service as
absent; `vewao_container_state_scrape_success` becomes zero instead.

## Import the dashboard

Follow `dashboards/README.md`. Grafana will prompt for the Prometheus and Loki
datasources during import; no datasource UID or credential is stored in git.

## Stop or roll back

Stopping this project does not change the shop, its volumes, NPM or releases:

```sh
docker compose down
```

Keep the `alloy-data` volume during ordinary rollback so read positions/WAL data
survive. Revoke the write-only token if the installation is abandoned or the
credential may have been exposed. Do not use `down -v` unless permanent deletion
of collector state is explicitly intended.

## Next increment

External synthetic checks and alert notifications are intentionally deferred for
the dev environment by owner decision on 2026-09-24. They remain required before
production cutover; follow `PRODUCTION-TODO.md` rather than adding them to dev.

- Add the two dev NPM virtual-host files with parsing, query-string/IP/PII
  minimization and rotation tests; never mount all shared NPM logs.
- Add the backend-aware storefront readiness route before treating the storefront
  as ready rather than merely alive.
