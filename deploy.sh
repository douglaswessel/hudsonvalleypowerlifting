#!/usr/bin/env bash
# Deploy the site to Cloudflare Pages (project "hvpowerlifting").
# Copies the site to a temp dir first so .git, README and this script are never published.
set -euo pipefail

cd "$(dirname "$0")"
DIST=$(mktemp -d)
trap 'rm -rf "$DIST"' EXIT

rsync -a --exclude .git --exclude .gitignore --exclude .DS_Store \
  --exclude README.md --exclude deploy.sh --exclude .wrangler ./ "$DIST/"

cd "$DIST"
npx wrangler pages deploy . --project-name hvpowerlifting --branch main --commit-dirty=true
