#!/usr/bin/env bash
set -euo pipefail
client_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
platform_dir="${VEWAO_PLATFORM_DIR:-$(cd "$client_dir/../../../vewao-platform" && pwd)}"
cd "$platform_dir"
if [[ ! -f .env.dev ]]; then
  node -e 'const fs = require("node:fs"); const crypto = require("node:crypto"); fs.writeFileSync(".env.dev", fs.readFileSync(".env.dev.template", "utf8").replaceAll("replace-with-a-long-random-value", () => crypto.randomBytes(32).toString("hex")), { mode: 0o600 })' 
fi
docker info >/dev/null
docker compose build platform
docker compose up -d --wait postgres redis
# Explicit one-shot migration: failures stop setup, never a restart loop.
docker compose run --rm platform pnpm --filter @vewao/core db:migrate
seed_output="$(docker compose run --rm -T platform pnpm --filter @vewao/core seed)"
publishable_key="$(printf '%s\n' "$seed_output" | sed -n 's/^LOCAL_PUBLISHABLE_KEY=//p' | tail -1 | tr -d '\r')"
if [[ "$publishable_key" != pk_* ]]; then
  printf '%s\n' 'Seed did not return a publishable key.' >&2
  exit 1
fi
# Update only the connection settings; preserve existing client values.
node "$client_dir/scripts/write-local-env.mjs" "$publishable_key"
docker compose up -d --wait platform
printf '%s\n' 'Backend starting: http://localhost:9000/app' 'Start storefront: cd storefront && pnpm install --frozen-lockfile && pnpm dev'
