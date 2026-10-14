#!/usr/bin/env bash
# Vendors @vewao/storefront-kit from a vewao-platform checkout (D18).
# Usage: scripts/vendor-storefront-kit.sh <path to vewao-platform>
# The checkout must be clean, so the recorded revision is what was packed.
set -euo pipefail

platform="${1:?path to a vewao-platform checkout}"
here="$(cd "$(dirname "$0")/.." && pwd)"

if [ -n "$(git -C "$platform" status --porcelain -- packages/storefront-kit)" ]; then
  echo "packages/storefront-kit has uncommitted changes in $platform" >&2
  exit 1
fi
rev="$(git -C "$platform" rev-parse --short=12 HEAD)"
version="$(node -p "require('$platform/packages/storefront-kit/package.json').version")"
name="vewao-storefront-kit-$version-$rev.tgz"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
(cd "$platform/packages/storefront-kit" && pnpm pack --pack-destination "$tmp" >/dev/null)

rm -f "$here"/vendor/vewao-storefront-kit-*.tgz
mv "$tmp/vewao-storefront-kit-$version.tgz" "$here/vendor/$name"
(cd "$here" && pnpm add "@vewao/storefront-kit@file:vendor/$name")
echo "Vendored $name (vewao-platform $rev)."
