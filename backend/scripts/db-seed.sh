#!/usr/bin/env bash
# Production-safe seed — tsx devDependency olmadan da calisir (npx tsx).
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "HATA: DATABASE_URL yok (.env kontrol edin)"
  exit 1
fi

echo "  Seed basliyor (DATABASE_URL ok)..."

if [ -x ./node_modules/.bin/tsx ]; then
  ./node_modules/.bin/tsx prisma/seed.ts
else
  npx --yes tsx prisma/seed.ts
fi

echo "  Seed tamamlandi."
