#!/usr/bin/env bash
# Admin sifresini .env SEED_ADMIN_PASSWORD degerine sifirlar.
# Sunucuda: cd backend && bash scripts/admin-sifre-sifirla.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "ERROR: backend/.env bulunamadi"
  exit 1
fi

echo "ADMIN kullanicisi seed sifresine sifirlaniyor ..."
npm run db:seed
echo "Tamam. Giris: \${SEED_ADMIN_KODU:-ADMIN} / .env icindeki SEED_ADMIN_PASSWORD"
