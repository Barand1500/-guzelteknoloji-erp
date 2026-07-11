#!/usr/bin/env bash
# Sunucuda tek seferlik backend baglanti kontrolu ve onarim.
# Kullanim: cd ~/htdocs/erp.guzelteknoloji.com/backend && bash scripts/sunucu-baglanti.sh
set -euo pipefail

SITE="${DEPLOY_SITE:-$HOME/htdocs/erp.guzelteknoloji.com}"
API_PORT="${API_PORT:-3007}"
PUBLIC_URL="${PUBLIC_URL:-https://erp.guzelteknoloji.com}"
PM2_NAME="${PM2_NAME:-erp-api}"

cd "$(dirname "$0")/.."
BACKEND_DIR="$(pwd)"

echo ""
echo "=== ERP Sunucu Baglanti Kontrolu ==="
echo "  Backend: $BACKEND_DIR"
echo "  API:     http://127.0.0.1:${API_PORT}"
echo "  Public:  ${PUBLIC_URL}/api/health"
echo ""

if [ ! -f .env ]; then
  echo "HATA: .env yok."
  echo "  cp .env.example .env && nano .env"
  exit 1
fi

echo "[1/5] .env kontrolu ..."
for key in DATABASE_URL JWT_SECRET; do
  if ! grep -qE "^${key}=.+" .env; then
    echo "  HATA: .env icinde ${key} eksik veya bos."
    exit 1
  fi
  echo "  OK   ${key}"
done

if grep -qE '^MOCK_AUTH=(1|true|yes)' .env; then
  echo "  UYARI: MOCK_AUTH acik — production icin .env'de MOCK_AUTH=0 yapin."
else
  echo "  OK   MOCK_AUTH=0 (gercek DB auth)"
fi

echo ""
echo "[2/5] PM2 durumu ..."
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 status "$PM2_NAME"
else
  echo "  HATA: ${PM2_NAME} PM2'de yok. Once site kokunde ./deploy.sh calistirin."
  exit 1
fi

echo ""
echo "[3/5] Yerel API (nginx olmadan) ..."
LOCAL_HEALTH=0
if curl -sf "http://127.0.0.1:${API_PORT}/api/health" | grep -q '"durum"'; then
  echo "  OK   http://127.0.0.1:${API_PORT}/api/health"
  LOCAL_HEALTH=1
else
  echo "  FAIL http://127.0.0.1:${API_PORT}/api/health"
  echo "       pm2 logs ${PM2_NAME} --lines 40"
fi

TANIM_CODE="$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:${API_PORT}/api/admin/tanimlar/firmalar" 2>/dev/null || echo 000)"
if [ "$TANIM_CODE" = "401" ]; then
  echo "  OK   /api/admin/tanimlar/firmalar (401 — route mevcut)"
elif [ "$TANIM_CODE" = "404" ]; then
  echo "  FAIL /api/admin/tanimlar/firmalar (404 — eski backend build, ./deploy.sh calistirin)"
else
  echo "  WARN /api/admin/tanimlar/firmalar (HTTP ${TANIM_CODE})"
fi

KISAYOL_CODE="$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:${API_PORT}/api/admin/kullanici-ayarlari/kisayol" 2>/dev/null || echo 000)"
if [ "$KISAYOL_CODE" = "401" ]; then
  echo "  OK   /api/admin/kullanici-ayarlari/kisayol (401 — route mevcut)"
elif [ "$KISAYOL_CODE" = "404" ]; then
  echo "  FAIL /api/admin/kullanici-ayarlari/kisayol (404 — eski backend, ./deploy.sh + sunucu-api-duzelt.sh)"
else
  echo "  WARN /api/admin/kullanici-ayarlari/kisayol (HTTP ${KISAYOL_CODE})"
fi

echo ""
echo "[4/5] Veritabani seed ..."
npm run db:seed
echo "  Seed tamamlandi (ADMIN kullanicisi upsert)."

echo ""
echo "[5/5] Public nginx proxy ..."
PUB_CODE="$(curl -sS -o /dev/null -w '%{http_code}' "${PUBLIC_URL}/api/health" 2>/dev/null || echo 000)"
PUB_BODY="$(curl -sS "${PUBLIC_URL}/api/health" 2>/dev/null | head -c 80 || true)"
if [ "$PUB_CODE" = "200" ] && echo "$PUB_BODY" | grep -q '"durum"'; then
  echo "  OK   ${PUBLIC_URL}/api/health"
else
  echo "  FAIL ${PUBLIC_URL}/api/health (HTTP ${PUB_CODE})"
  echo ""
  echo "  Nginx /api proxy eksik veya yanlis. CloudPanel'e su blogu ekleyin:"
  echo "  (Ornek: repo/nginx-api.conf.example)"
  echo ""
  echo "  location /api {"
  echo "      proxy_pass http://127.0.0.1:${API_PORT};"
  echo "      proxy_http_version 1.1;"
  echo "      proxy_set_header Host \$host;"
  echo "      proxy_set_header X-Real-IP \$remote_addr;"
  echo "      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
  echo "      proxy_set_header X-Forwarded-Proto \$scheme;"
  echo "  }"
  echo ""
  if [ "$LOCAL_HEALTH" = "1" ]; then
    echo "  Yerel API calisiyor; sorun büyük ihtimalle nginx proxy ayarinda."
  else
    echo "  Yerel API de calismiyor; once: cd ${SITE} && FRONTEND_MOCK_AUTH=0 ./deploy.sh"
  fi
fi

echo ""
echo "Smoke test ..."
bash scripts/api-smoke.sh || true

echo ""
echo "=== Ozet ==="
echo "  Deploy:  cd ${SITE} && FRONTEND_MOCK_AUTH=0 ./deploy.sh"
echo "  Giris:   ADMIN / seed sifresi (varsayilan: eRc241016!)"
echo "  Tarayici: Ctrl+Shift+R ile hard refresh"
echo ""
