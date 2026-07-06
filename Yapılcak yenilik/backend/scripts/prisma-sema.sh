#!/usr/bin/env bash
# .env icindeki DB_TURU'na gore Prisma sema dosyasini yazar
set -euo pipefail

ENV_DOSYA="${1:-.env}"
DB_TURU="sube"

if [ -f "$ENV_DOSYA" ]; then
  DB_TURU="$(grep -E '^DB_TURU=' "$ENV_DOSYA" | tail -n1 | cut -d= -f2- | tr -d '"' | tr -d "'" | xargs || true)"
fi

if [ -z "$DB_TURU" ]; then
  DB_TURU="sube"
fi

if [ "$DB_TURU" = "master" ]; then
  echo "prisma/schema.prisma"
else
  echo "prisma/schema-sube.prisma"
fi
