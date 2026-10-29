#!/usr/bin/env bash
# Baut typ0 lokal und kopiert dist/ auf den Server. Aufruf aus dem Repo-Wurzelverzeichnis:
#   deploy/deploy.sh
set -euo pipefail

HOST="${DEPLOY_HOST:-towelies-server}"
TARGET="${DEPLOY_TARGET:-/var/www/typ0.dev}"

cd "$(dirname "$0")/.."
npm ci
npm test
npm run build

ssh "$HOST" "mkdir -p '$TARGET'"
# Erst die neuen Assets, dann index.html: Wer die Seite währenddessen lädt, bekommt nie
# eine index.html, deren Assets noch fehlen.
rsync -az dist/assets/ "$HOST:$TARGET/assets/"
rsync -az --delete dist/ "$HOST:$TARGET/"

echo "Deployt nach $HOST:$TARGET"
