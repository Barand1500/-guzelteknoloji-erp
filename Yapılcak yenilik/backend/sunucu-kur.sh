#!/usr/bin/env bash
# Restorant backend — ilk kurulum (sunucuda calistirin)
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "HATA: .env dosyasi yok!"
  echo "  cp .env.example .env"
  echo "  nano .env   # DATABASE_URL ve JWT_SECRET doldurun"
  exit 1
fi

echo "==> Bagimliliklar (dev dahil — build icin gerekli)"
npm ci

echo "==> Veritabani tablolari"
npm run db:push

echo "==> Tohum verisi"
npm run db:seed

echo "==> TypeScript derleme"
npm run build

echo ""
echo "Kurulum tamam. Baslatmak icin:"
echo "  npm start"
echo "veya PM2 ile:"
echo "  npx pm2 start ecosystem.config.cjs"
echo "  npx pm2 save"
echo "  npx pm2 startup   # (root/sudo gerekebilir)"
