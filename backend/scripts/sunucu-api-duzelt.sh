#!/usr/bin/env bash
# CloudPanel Node.js + PM2 cakismasini giderir; 3007'de guncel erp-api'yi baslatir.
# Kullanim: cd ~/htdocs/erp.guzelteknoloji.com/backend && bash scripts/sunucu-api-duzelt.sh
set -euo pipefail

SITE="${DEPLOY_SITE:-$HOME/htdocs/erp.guzelteknoloji.com}"
API_PORT="${API_PORT:-3007}"
PUBLIC_URL="${PUBLIC_URL:-https://erp.guzelteknoloji.com}"
PM2_NAME="${PM2_NAME:-erp-api}"

cd "$(dirname "$0")/.."
BACKEND_DIR="$(pwd)"

echo ""
echo "=== ERP API Onarimi (kisayol 404 / EADDRINUSE) ==="
echo "  Backend: $BACKEND_DIR"
echo ""
echo "ONEMLI — CloudPanel'de Node.js uygulamasini DURDURUN:"
echo "  Site → Ayarlar → Node.js → uygulamayi kapatin (port $API_PORT)."
echo "  ERP yalnizca PM2 ($PM2_NAME) ile calisir; CloudPanel Node ile birlikte kullanmayin."
echo ""

if [ ! -f dist/routes/kullanici-ayarlari.js ]; then
  echo "HATA: dist/routes/kullanici-ayarlari.js yok."
  echo "  Once: cd $SITE && ./deploy.sh"
  exit 1
fi
echo "  OK   dist/routes/kullanici-ayarlari.js mevcut"

echo ""
echo "[1/4] Port $API_PORT dinleyen process ..."
if command -v ss >/dev/null 2>&1; then
  ss -tlnp 2>/dev/null | grep ":${API_PORT}" || echo "  (port bos)"
fi

echo ""
echo "[2/4] PM2 durdur + port serbest ..."
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 delete "$PM2_NAME" 2>/dev/null || pm2 stop "$PM2_NAME" || true
fi
sleep 1
chmod +x scripts/api-port-serbest.sh 2>/dev/null || true
if [ -x scripts/api-port-serbest.sh ]; then
  API_PORT="$API_PORT" bash scripts/api-port-serbest.sh || true
fi
sleep 1

echo ""
echo "[3/4] PM2 baslat ..."
pm2 start ecosystem.config.cjs
pm2 save
sleep 2

echo ""
echo "[4/4] Route kontrolu ..."
pm2 status "$PM2_NAME" || true

LOCAL_KISAYOL="$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:${API_PORT}/api/admin/kullanici-ayarlari/kisayol" 2>/dev/null || echo 000)"
LOCAL_KULL="$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:${API_PORT}/api/admin/kullanicilar" 2>/dev/null || echo 000)"
PUB_KISAYOL="$(curl -sS -o /dev/null -w '%{http_code}' "${PUBLIC_URL}/api/admin/kullanici-ayarlari/kisayol" 2>/dev/null || echo 000)"

echo "  Yerel kisayol:     HTTP $LOCAL_KISAYOL (beklenen 401)"
echo "  Yerel kullanicilar: HTTP $LOCAL_KULL (beklenen 401)"
echo "  Public kisayol:    HTTP $PUB_KISAYOL (beklenen 401)"

OK=1
if ! pm2 describe "$PM2_NAME" 2>/dev/null | grep -qE 'status.*online'; then
  echo ""
  echo "  HATA: PM2 online degil. pm2 logs $PM2_NAME --lines 30"
  OK=0
fi
if [ "$LOCAL_KISAYOL" != "401" ]; then
  echo ""
  echo "  HATA: Yerel kisayol route yok (HTTP $LOCAL_KISAYOL). cd $SITE && ./deploy.sh"
  OK=0
fi
if [ "$PUB_KISAYOL" = "404" ] && [ "$LOCAL_KISAYOL" = "401" ]; then
  echo ""
  echo "  HATA: Public URL eski backend'e gidiyor veya nginx yanlis."
  echo "  CloudPanel Node.js'i durdurun; nginx /api -> 127.0.0.1:$API_PORT olmali."
  OK=0
fi

echo ""
if [ "$OK" = "1" ]; then
  echo "=== Tamam — tarayicida Ctrl+Shift+R, sonra Kısayol Ayarlari → Kaydet ==="
else
  echo "=== Sorun devam ediyor — yukaridaki adimlari uygulayin ==="
  exit 1
fi
echo ""
