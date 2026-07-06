#!/usr/bin/env bash
# prisma db push — DB_TURU'na gore dogru sema dosyasini kullanir
set -euo pipefail

cd "$(dirname "$0")/.."
SCHEMA="$(bash scripts/prisma-sema.sh .env)"
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
  if [ "$SCHEMA" = "prisma/schema.prisma" ]; then
    npm run db:seed
  else
    npm run db:seed:sube
  fi
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
echo "  sube1-db yari kalmis olabilir. Cozum (veri silinir):"
echo "    DB_RESET=1 ./deploy.sh"
exit 1
