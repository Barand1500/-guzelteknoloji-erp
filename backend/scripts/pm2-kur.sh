#!/usr/bin/env bash
# PM2 ilk kurulum — CloudPanel site kullanicisi ile SSH'ta calistirin.
#   cd ~/htdocs/erp.guzelteknoloji.com/backend && bash scripts/pm2-kur.sh
set -euo pipefail

PM2_NAME="${PM2_NAME:-erp-api}"
API_PORT="${API_PORT:-3007}"

cd "$(dirname "$0")/.."
BACKEND_DIR="$(pwd)"

echo ""
echo "=== ERP PM2 Kurulumu ==="
echo "  Dizin: $BACKEND_DIR"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "HATA: node bulunamadi. CloudPanel'de Node.js 20+ kurulu olmali."
  exit 1
fi
echo "  Node: $(node -v)"
echo "  npm:  $(npm -v)"

if ! command -v pm2 >/dev/null 2>&1; then
  echo ""
  echo "[1/4] PM2 global kurulum ..."
  npm install -g pm2
else
  echo ""
  echo "[1/4] PM2 zaten kurulu: $(pm2 -v)"
fi

if [ ! -f .env ]; then
  echo ""
  echo "HATA: .env yok."
  echo "  cp .env.example .env"
  echo "  nano .env   # DATABASE_URL, JWT_SECRET doldurun"
  exit 1
fi

if [ ! -f dist/index.js ]; then
  echo ""
  echo "HATA: dist/index.js yok — once site kokunde ./deploy.sh calistirin."
  exit 1
fi

chmod +x scripts/api-port-serbest.sh 2>/dev/null || true

echo ""
echo "[2/4] PM2 uygulama baslatiliyor ($PM2_NAME) ..."
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 delete "$PM2_NAME" 2>/dev/null || pm2 stop "$PM2_NAME" || true
fi
sleep 1
if [ -x scripts/api-port-serbest.sh ]; then
  API_PORT="$API_PORT" bash scripts/api-port-serbest.sh || true
fi
sleep 1
pm2 start ecosystem.config.cjs

echo ""
echo "[3/4] PM2 kayit ..."
pm2 save

echo ""
echo "[4/4] Saglik kontrolu ..."
sleep 2
if curl -sf "http://127.0.0.1:${API_PORT}/api/health" | grep -q '"durum"'; then
  echo "  OK  http://127.0.0.1:${API_PORT}/api/health"
else
  echo "  FAIL API yanit vermiyor."
  echo "  pm2 logs ${PM2_NAME} --lines 40"
  exit 1
fi

echo ""
echo "=== PM2 hazir ==="
pm2 status "$PM2_NAME"
echo ""
echo "Sunucu yeniden basladiginda otomatik acilsin istiyorsaniz (bir kez):"
echo "  pm2 startup"
echo "  (cikan sudo komutunu kopyalayip calistirin, sonra: pm2 save)"
echo ""
echo "Sonraki adimlar:"
echo "  1. CloudPanel nginx: repo/nginx-api.conf.example"
echo "  2. cd ~/htdocs/erp.guzelteknoloji.com && ./deploy.sh"
echo ""
