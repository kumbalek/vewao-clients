# Runtime secrets

Create `grafana-metrics-password` and `grafana-logs-password` in this directory
on the server. Each file contains only the corresponding write-only Grafana
Cloud access-policy token and a trailing newline. Keep them owned by `root`, set
their numeric group to Alloy's GID `473`, and set mode `640`. This lets only root
and the non-root Alloy process read them.

The files are ignored by git. Do not reuse an account token with dashboard,
administration or delete permissions.
