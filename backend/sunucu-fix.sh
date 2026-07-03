#!/usr/bin/env bash
# Windows'tan yuklenen node_modules bozuksa bu scripti calistirin
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "HATA: .env yok. Once .env olusturun."
  exit 1
fi

PRISMA="node ./node_modules/prisma/build/index.js"
TSC="node ./node_modules/typescript/bin/tsc"

echo "==> Eski node_modules siliniyor (Windows binary kalintisi)"
rm -rf node_modules

echo "==> Bagimliliklar Linux icin yeniden yukleniyor"
npm ci

echo "==> Binary izinleri (Permission denied onlemi)"
chmod +x node_modules/.bin/* 2>/dev/null || true

echo "==> Prisma client (Linux engine)"
$PRISMA generate --schema prisma/schema.prisma

echo "==> Veritabani sifirlanip yeniden olusturuluyor (tum veri silinir)"
$PRISMA db push --force-reset --schema prisma/schema.prisma

echo "==> Tohum verisi"
npx tsx prisma/seed.ts

echo "==> Eski derleme siliniyor"
rm -rf dist

echo "==> Derleme"
$TSC

echo "==> Derleme kontrolu"
if grep -rq 'prismaMaster' dist/ 2>/dev/null; then
  echo "HATA: dist/ hala eski kod iciyor. src/ klasorunu guncelleyip tekrar calistirin."
  exit 1
fi

echo "==> PM2 yeniden baslat"
npx pm2 restart erp-api --update-env || npx pm2 start ecosystem.config.cjs

echo ""
echo "Test: curl http://127.0.0.1:3006/api/health"
