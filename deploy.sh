#!/usr/bin/env bash
set -euo pipefail

# Single-file deploy script for CloudPanel layout
#   ~/htdocs/erp.guzelteknoloji.com/
#     deploy.sh
#     repo/
#     frontend/
#     backend/
#
# Nginx /api proxy (502 onlemek icin): repo/nginx-api.conf.example
# CloudPanel → Site → Vhost → Nginx Directives icine location /api blogunu ekleyin.

SITE="${DEPLOY_SITE:-$HOME/htdocs/erp.guzelteknoloji.com}"
GIT_REMOTE="https://github.com/Barand1500/-guzelteknoloji-erp.git"
GIT_BRANCH="main"
PM2_NAME="erp-api"
API_PORT="3007"
DB_RESET="${DB_RESET:-0}"
PUBLIC_URL="${PUBLIC_URL:-https://erp.guzelteknoloji.com}"

# 1 => frontend mock auth (gelistirme); 0 => gercek backend (production varsayilan)
FRONTEND_MOCK_AUTH="${FRONTEND_MOCK_AUTH:-0}"

echo ""
echo "=== GUZEL TEKNOLOJI ERP - DEPLOY START ==="
echo "  Site: $SITE"
echo "  Branch: $GIT_BRANCH"
echo ""

if [ ! -d "$SITE/repo/.git" ]; then
  echo "ERROR: Missing git repo at $SITE/repo"
  echo "Run initial setup:"
  echo "  mkdir -p $SITE"
  echo "  cd $SITE"
  echo "  git clone $GIT_REMOTE repo"
  echo "  cp repo/deploy.sh ."
  echo "  mkdir -p backend"
  echo "  cp repo/backend/.env.example backend/.env"
  echo "  nano backend/.env"
  echo "  chmod +x deploy.sh && ./deploy.sh"
  exit 1
fi

if [ ! -f "$SITE/backend/.env" ]; then
  echo "ERROR: Missing $SITE/backend/.env"
  echo "  cp $SITE/repo/backend/.env.example $SITE/backend/.env"
  echo "  nano $SITE/backend/.env"
  exit 1
fi

echo "[1/6] Updating git from origin/$GIT_BRANCH ..."
cd "$SITE/repo"
git fetch origin "$GIT_BRANCH"
git reset --hard "origin/$GIT_BRANCH"
cp "$SITE/repo/deploy.sh" "$SITE/deploy.sh"
chmod +x "$SITE/deploy.sh"
echo "  Commit: $(git log -1 --oneline)"

echo "[2/6] Building frontend ..."
cd "$SITE/repo"
npm ci
if [ "$FRONTEND_MOCK_AUTH" = "1" ]; then
  echo "  Frontend mode: mock auth (VITE_BACKEND_YOK=true)"
  VITE_API_URL=/api VITE_BACKEND_YOK=true npx vite build
else
  echo "  Frontend mode: real auth (VITE_BACKEND_YOK=false)"
  VITE_API_URL=/api VITE_BACKEND_YOK=false npx vite build
fi
rsync -a --delete "$SITE/repo/frontend/" "$SITE/frontend/"
FRONTEND_JS="$(grep -oE 'index-[^"]+\.js' "$SITE/frontend/index.html" | head -1 || true)"
echo "  Output: $SITE/frontend/ (${FRONTEND_JS:-?})"

echo "[3/6] Building backend ..."
cd "$SITE/repo/backend"
npm ci
npm run build
rsync -a \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='uploads' \
  "$SITE/repo/backend/" "$SITE/backend/"
echo "  Output: $SITE/backend/dist/"

echo "[4/6] Installing backend production dependencies ..."
cd "$SITE/backend"
npm ci --omit=dev
chmod +x scripts/db-push-safe.sh 2>/dev/null || true
chmod +x scripts/db-seed.sh 2>/dev/null || true
chmod +x scripts/sunucu-baglanti.sh 2>/dev/null || true
chmod +x scripts/api-smoke.sh 2>/dev/null || true

echo "[5/6] Syncing database ..."
PRISMA_SCHEMA="$(bash scripts/prisma-sema.sh)"
echo "  Schema: $PRISMA_SCHEMA"
npx prisma generate --schema "$PRISMA_SCHEMA"
DB_OK=1
export DB_RESET
if bash scripts/db-push-safe.sh; then
  echo "  Database synced."
  echo "  Running seed (upsert — idempotent) ..."
  SEED_DIR="$SITE/repo/backend"
  if [ ! -d "$SEED_DIR/node_modules/.bin" ]; then
    ( cd "$SEED_DIR" && npm ci )
  fi
  (
    cd "$SEED_DIR"
    set -a
    # shellcheck disable=SC1091
    source "$SITE/backend/.env"
    set +a
    bash scripts/db-seed.sh
  )
else
  DB_OK=0
  echo ""
  echo "  WARNING: Database step failed; deploy continues."
  echo "  Manual: cd $SITE/backend && bash scripts/db-push-safe.sh"
  echo "  Reset install: DB_RESET=1 ./deploy.sh"
  echo ""
fi

echo "[6/6] Restarting PM2 ($PM2_NAME on $API_PORT) ..."
cd "$SITE/backend"
if ! command -v pm2 >/dev/null 2>&1; then
  echo "  PM2 bulunamadi — global kurulum ..."
  npm install -g pm2
fi
chmod +x scripts/pm2-kur.sh 2>/dev/null || true
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME" --update-env
else
  pm2 start ecosystem.config.cjs
fi
pm2 save

# Yerel saglik kontrolu — PM2 restart sonrasi kisa bekleme
sleep 2

echo ""
if [ "$DB_OK" = "1" ]; then
  echo "=== DEPLOY COMPLETE ==="
else
  echo "=== DEPLOY COMPLETE (database warning) ==="
fi

echo ""
echo "API checks (127.0.0.1:${API_PORT}) ..."
OTURUM_OK=0

if curl -sf "http://127.0.0.1:${API_PORT}/api/health" >/dev/null; then
  echo "  OK  /api/health"
else
  echo "  FAIL /api/health - check: pm2 logs ${PM2_NAME} --lines 30"
fi

if curl -sf "http://127.0.0.1:${API_PORT}/api/admin/auth/oturum-secenekleri" | grep -q '"firmalar"'; then
  OTURUM_OK=1
  echo "  OK  /api/admin/auth/oturum-secenekleri"
else
  echo "  FAIL /api/admin/auth/oturum-secenekleri"
fi

TANIM_CODE="$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:${API_PORT}/api/admin/tanimlar/firmalar" 2>/dev/null || echo 000)"
if [ "$TANIM_CODE" = "401" ]; then
  echo "  OK  /api/admin/tanimlar/firmalar (401 — route mevcut)"
else
  echo "  FAIL /api/admin/tanimlar/firmalar (HTTP ${TANIM_CODE}, beklenen 401)"
fi

echo ""
echo "Public API check (${PUBLIC_URL}) ..."
PUB_CODE="$(curl -sS -o /dev/null -w '%{http_code}' "${PUBLIC_URL}/api/health" 2>/dev/null || echo 000)"
PUB_BODY="$(curl -sS "${PUBLIC_URL}/api/health" 2>/dev/null | head -c 80 || true)"
if [ "$PUB_CODE" = "200" ] && echo "$PUB_BODY" | grep -q '"durum"'; then
  echo "  OK  ${PUBLIC_URL}/api/health"
else
  echo "  FAIL ${PUBLIC_URL}/api/health (HTTP ${PUB_CODE})"
  echo "  Nginx /api proxy gerekli — bkz. repo/nginx-api.conf.example"
fi

echo ""
if [ "$OTURUM_OK" = "1" ]; then
  echo "Frontend updated. Do hard refresh (Ctrl+Shift+R)."
else
  echo "Deploy finished; login API is still not ready."
  echo "Check: pm2 logs ${PM2_NAME} --lines 40"
  echo "       cd $SITE/backend && bash scripts/sunucu-baglanti.sh"
fi
echo ""