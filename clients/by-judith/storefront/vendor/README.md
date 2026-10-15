# Vendored packages

`vewao-storefront-kit-<version>-<platform revision>.tgz` is `pnpm pack` of
`vewao-platform/packages/storefront-kit` at the revision in its name (D18 in the
workspace `docs/DECISIONS.md`). The same file is installed locally, in CI and in
the Docker build, so no platform checkout or registry token is needed.

Update it from a clean platform checkout, then run the checks and commit the
tarball, `package.json` and `pnpm-lock.yaml` together:

```sh
scripts/vendor-storefront-kit.sh ../../../../vewao-platform
pnpm typecheck && pnpm test && pnpm test:e2e
```

Do not edit the kit here; change it in vewao-platform and re-vendor.
