#!/usr/bin/env bash
set -euo pipefail

# Single-file deploy script for CloudPanel layout
#   ~/htdocs/erp.guzelteknoloji.com/
#     deploy.sh
#     repo/
#     frontend/
#     backend/
#
# Nginx (CloudPanel -> Site -> Vhost -> Nginx Config), server { } icinde:
#   location /api/ {
#       proxy_pass http://127.0.0.1:3006/;
#       proxy_http_version 1.1;
#       proxy_set_header Host $host;
#       proxy_set_header X-Real-IP $remote_addr;
#       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#       proxy_set_header X-Forwarded-Proto $scheme;
#   }
# Backend hem /api/admin hem /admin yollarini dinler (proxy /api on ekini dusururse de calisir).

SITE="${DEPLOY_SITE:-$HOME/htdocs/erp.guzelteknoloji.com}"
GIT_REMOTE="https://github.com/Barand1500/-guzelteknoloji-erp.git"
GIT_BRANCH="main"
PM2_NAME="erp-api"
API_PORT="3006"
DB_RESET="${DB_RESET:-0}"

# Temporary toggle:
# 1 => frontend uses mock auth (skip real login flow)
# 0 => frontend uses real backend auth
FRONTEND_MOCK_AUTH="${FRONTEND_MOCK_AUTH:-0}"

api_get_check() {
  local path="$1"
  local expect="$2"
  local raw code body
  raw="$(curl -sS -w $'\nHTTP_CODE:%{http_code}' "http://127.0.0.1:${API_PORT}${path}" 2>/dev/null || echo $'\nHTTP_CODE:000')"
  code="${raw##*HTTP_CODE:}"
  body="${raw%HTTP_CODE:*}"
  body="$(echo "$body" | tr -d '\r')"
  if [ "$code" = "200" ] && echo "$body" | grep -q "$expect"; then
    echo "  OK  ${path} (HTTP ${code})"
    return 0
  fi
  echo "  FAIL ${path} (HTTP ${code})"
  if [ -n "$body" ]; then
    echo "       $(echo "$body" | head -c 140)"
  fi
  return 1
}

port_serbest_birak() {
  local port="$1"
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" 2>/dev/null || true
  elif command -v lsof >/dev/null 2>&1; then
    lsof -ti ":${port}" 2>/dev/null | xargs -r kill -9 2>/dev/null || true
  fi
  sleep 1
}

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

MOCK_AUTH_VAL="$(grep -E '^MOCK_AUTH=' "$SITE/backend/.env" 2>/dev/null | cut -d= -f2- | tr -d ' "' | tr '[:upper:]' '[:lower:]' || true)"
echo "  backend/.env MOCK_AUTH=${MOCK_AUTH_VAL:-<yok>}"
if [ "$FRONTEND_MOCK_AUTH" = "0" ] && { [ "$MOCK_AUTH_VAL" = "true" ] || [ "$MOCK_AUTH_VAL" = "1" ] || [ "$MOCK_AUTH_VAL" = "yes" ]; }; then
  echo ""
  echo "  WARNING: Frontend gercek API kullaniyor ama backend MOCK_AUTH acik."
  echo "  Production icin backend/.env icinde MOCK_AUTH=0 yapin, sonra tekrar deploy edin."
  echo ""
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
  VITE_API_URL=/api VITE_BACKEND_YOK=true npm run build
else
  echo "  Frontend mode: real auth (VITE_BACKEND_YOK=false)"
  VITE_API_URL=/api VITE_BACKEND_YOK=false npm run build
fi
rsync -a --delete "$SITE/repo/frontend/" "$SITE/frontend/"
FRONTEND_JS="$(grep -oE 'index-[^"]+\.js' "$SITE/frontend/index.html" | head -1 || true)"
echo "  Output: $SITE/frontend/ (${FRONTEND_JS:-?})"

echo "[3/6] Building backend ..."
cd "$SITE/repo/backend"
npm ci
npm run build
for f in dist/index.js dist/routes/auth.js dist/routes/tanimlar.js; do
  if [ ! -f "$f" ]; then
    echo "  ERROR: Build eksik: $f"
    exit 1
  fi
done
rsync -a \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='uploads' \
  "$SITE/repo/backend/" "$SITE/backend/"
echo "  Output: $SITE/backend/dist/"

echo "[4/6] Installing backend production dependencies ..."
cd "$SITE/backend"
npm ci --omit=dev
chmod +x scripts/db-push-safe.sh scripts/api-smoke.sh 2>/dev/null || true

echo "[5/6] Syncing database ..."
PRISMA_SCHEMA="$(bash scripts/prisma-sema.sh)"
echo "  Schema: $PRISMA_SCHEMA"
npx prisma generate --schema "$PRISMA_SCHEMA"
DB_OK=1
export DB_RESET
if bash scripts/db-push-safe.sh; then
  echo "  Database synced."
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
pm2 delete "$PM2_NAME" 2>/dev/null || true
port_serbest_birak "$API_PORT"
pm2 start ecosystem.config.cjs
pm2 save
sleep 3

echo ""
if [ "$DB_OK" = "1" ]; then
  echo "=== DEPLOY COMPLETE ==="
else
  echo "=== DEPLOY COMPLETE (database warning) ==="
fi

echo ""
echo "API checks (127.0.0.1:${API_PORT}) ..."
OTURUM_OK=0
HEALTH_OK=0

if api_get_check "/api/health" '"durum"'; then
  HEALTH_OK=1
  HEALTH_BODY="$(curl -sS "http://127.0.0.1:${API_PORT}/api/health" 2>/dev/null || true)"
  if echo "$HEALTH_BODY" | grep -q '"dbTuru":"erp"'; then
    echo "  OK  dbTuru=erp (yeni backend)"
  else
    echo "  WARN dbTuru erp degil — port ${API_PORT} baska uygulama tarafindan kullaniliyor olabilir"
    echo "       ${HEALTH_BODY}"
    echo "  -> ss -ltnp | grep :${API_PORT}"
    echo "  -> pm2 list"
  fi
else
  echo "  -> pm2 logs ${PM2_NAME} --lines 40"
fi

if api_get_check "/api/admin/auth/oturum-secenekleri" '"firmalar"'; then
  OTURUM_OK=1
elif api_get_check "/admin/auth/oturum-secenekleri" '"firmalar"'; then
  OTURUM_OK=1
  echo "  (nginx /api on ekini dusuruyor; /admin yolu calisiyor)"
fi

echo ""
if [ "$OTURUM_OK" = "1" ]; then
  echo "Frontend updated. Hard refresh (Ctrl+Shift+R)."
  echo "Giris: ADMIN / eRc241016!  (MOCK_AUTH=0 ise DB seed kullanicisi)"
else
  echo "Login API hazir degil. Tanilama:"
  echo "  cd $SITE/backend && bash scripts/api-smoke.sh"
  echo "  pm2 logs ${PM2_NAME} --lines 40"
  echo "  grep MOCK_AUTH .env   # production: MOCK_AUTH=0"
  echo "Gecici panel erisimi: FRONTEND_MOCK_AUTH=1 ./deploy.sh"
fi
echo ""
