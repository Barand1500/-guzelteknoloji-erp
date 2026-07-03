#!/usr/bin/env bash
# prisma db push — ERP schema.prisma
set -euo pipefail

cd "$(dirname "$0")/.."
SCHEMA="$(bash scripts/prisma-sema.sh)"
LOG="$(mktemp)"

cleanup() { rm -f "$LOG"; }
trap cleanup EXIT

prisma_cmd() {
  npx prisma "$@" --schema "$SCHEMA"
}

echo "  Prisma sema: $SCHEMA"

if [ "${DB_RESET:-0}" = "1" ]; then
  echo "  DB_RESET=1 — tablolar sifirlanip yeniden olusturuluyor..."
  prisma_cmd db push --force-reset --accept-data-loss
  npm run db:seed
  exit 0
fi

set +e
prisma_cmd db push >"$LOG" 2>&1
PUSH_EXIT=$?
set -e
cat "$LOG"

if [ "$PUSH_EXIT" -eq 0 ]; then
  exit 0
fi

echo ""
echo "HATA: prisma db push basarisiz."
echo "  Cozum (veri silinir): DB_RESET=1 npm run db:push"
exit 1
