# Grafana dashboards

## Import the dev overview

1. In Grafana Cloud, open **Dashboards → New → Import**.
2. Upload `by-judith-dev-overview.json`.
3. Map **Prometheus** to the Grafana Cloud Prometheus datasource for instance
   `3594774`.
4. Map **Loki** to the Grafana Cloud Loki datasource for instance `1793059`.
5. Keep the dashboard UID `by-judith-dev-overview` and select **Import**.

The import contains no credentials or datasource UIDs. The mappings make it
portable between Grafana stacks.

The status, log and capacity panels use telemetry verified from 2026-09-23.
Dashboard version 4 adds live required-service state, restart/OOM state and
running-image references. Its status query aggregates by service and explicitly
selects the four required services. Deployment history, Cloudflare analytics, NPM state,
public probes and alert rules remain deliberately unavailable until those
collectors are implemented. Missing data must not be interpreted as healthy.

After import, verify:

- the platform API and storefront liveness panels show a value;
- telemetry freshness is less than three minutes;
- the service filter lists the By Judith Compose services;
- the log stream contains current entries;
- the four capacity panels and load chart contain data.
- the four required services show healthy, restart/OOM values are present and
  running image references are visible after installing the state exporter.

If the service variable is empty, confirm the selected Loki datasource and run
this query in Explore:

```logql
{client="by-judith", environment="dev"}
```
