#!/bin/bash
set -euo pipefail

# ERP — CloudPanel deploy
# Sunucu klasor yapisi:
#   ~/htdocs/panel.ornek.com/
#     deploy.sh
#     repo/       <- git clone
#     frontend/   <- nginx root
#     backend/    <- PM2 (port 3006, .env burada kalir)
#
# Ilk kurulum:
#   cd ~/htdocs/panel.ornek.com
#   git clone <repo-url> repo
#   cp repo/backend/.env.example backend/.env && nano backend/.env
#   chmod +x deploy.sh && ./deploy.sh
#
# Nginx (CloudPanel vhost):
#   location /api/ { proxy_pass http://127.0.0.1:3006/api/; ... }
#   location /uploads/ { proxy_pass http://127.0.0.1:3006/uploads/; ... }

# --- AYARLAR ---
SITE="${DEPLOY_SITE:-/home/panel/htdocs/panel.ornek.com}"
PM2_NAME="erp-api"
GIT_BRANCH="main"
API_PORT="3006"
# Ilk kurulumda veya sema sifirlanacaksa: DB_RESET=1 ./deploy.sh
DB_RESET="${DB_RESET:-0}"
# ---------------

echo ""
echo "=== SADEPANEL DEPLOY BASLIYOR ==="
echo ""

if [ ! -d "$SITE/repo/.git" ]; then
  echo "HATA: $SITE/repo klasorunde git projesi yok."
  echo "  cd $SITE"
  echo "  git clone <repo-url> repo"
  exit 1
fi

if [ ! -f "$SITE/backend/.env" ]; then
  echo "HATA: $SITE/backend/.env yok."
  echo "  cp $SITE/repo/backend/.env.example $SITE/backend/.env"
  echo "  nano $SITE/backend/.env"
  exit 1
fi

echo "[1/6] Git guncelleniyor..."
cd "$SITE/repo"
git fetch origin "$GIT_BRANCH"
git reset --hard "origin/$GIT_BRANCH"
cp "$SITE/repo/deploy.sh" "$SITE/deploy.sh"
chmod +x "$SITE/deploy.sh"

echo "[2/6] Frontend build..."
cd "$SITE/repo"
npm ci
VITE_API_URL=/api npm run build
rsync -a --delete "$SITE/repo/frontend/" "$SITE/frontend/"
FRONTEND_JS="$(grep -oE 'index-[^"]+\.js' "$SITE/frontend/index.html" | head -1 || true)"
echo "  Frontend: $SITE/frontend/ (${FRONTEND_JS:-index bulunamadi})"
if [ -f "$SITE/index.html" ]; then
  KOK_JS="$(grep -oE 'index-[^"]+\.js' "$SITE/index.html" | head -1 || true)"
  if [ -n "$KOK_JS" ] && [ "$KOK_JS" != "$FRONTEND_JS" ]; then
    echo ""
    echo "  UYARI: Site kokunde ESKI index.html var ($KOK_JS)"
    echo "  CloudPanel Document Root su olmali: $SITE/frontend"
    echo "  Degilse nginx eski dosyalari gosterir."
    echo ""
  fi
fi

echo "[3/6] Backend build..."
cd "$SITE/repo/backend"
npm ci
npm run build
rsync -a \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='uploads' \
  "$SITE/repo/backend/" "$SITE/backend/"

echo "[4/6] Backend bagimliliklari (sunucu)..."
cd "$SITE/backend"
npm ci
chmod +x scripts/db-push-safe.sh 2>/dev/null || true

echo "[5/6] Veritabani..."
PRISMA_SCHEMA="$(bash scripts/prisma-sema.sh)"
echo "  DB sema: $PRISMA_SCHEMA"
npx prisma generate --schema "$PRISMA_SCHEMA"
DB_OK=1
export DB_RESET
if bash scripts/db-push-safe.sh; then
  echo "  Veritabani guncellendi."
else
  DB_OK=0
  echo ""
  echo "  UYARI: Veritabani adimi basarisiz — deploy DEVAM EDIYOR (PM2 yenilenecek)."
  echo "  Manuel: cd $SITE/backend && bash scripts/db-push-safe.sh"
  echo "  Sifir kurulum (TUM VERI SILINIR): DB_RESET=1 ./deploy.sh"
  echo ""
fi

echo "[6/6] PM2 ($PM2_NAME, port $API_PORT)..."
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME" --update-env
else
  pm2 start ecosystem.config.cjs
fi
pm2 save

echo ""
if [ "$DB_OK" = "1" ]; then
  echo "=== DEPLOY TAMAMLANDI ==="
else
  echo "=== DEPLOY TAMAMLANDI (veritabani uyarisi var) ==="
fi
echo "API kontrolleri (127.0.0.1:${API_PORT})..."
HEALTH_OK=0
OTURUM_OK=0
if curl -sf "http://127.0.0.1:${API_PORT}/api/health" >/dev/null; then
  HEALTH_OK=1
  echo "  OK  /api/health"
else
  echo "  HATA /api/health — PM2 log: pm2 logs ${PM2_NAME} --lines 30"
fi
if curl -sf "http://127.0.0.1:${API_PORT}/api/admin/auth/oturum-secenekleri" | grep -q '"firmalar"'; then
  OTURUM_OK=1
  echo "  OK  /api/admin/auth/oturum-secenekleri"
else
  echo "  HATA /api/admin/auth/oturum-secenekleri (login combobox bos kalir)"
  echo "        Eski dist olabilir: cd $SITE/backend && npm run build && pm2 restart ${PM2_NAME}"
  echo "        Nginx dogru: location /api/ { proxy_pass http://127.0.0.1:${API_PORT}/api/; }"
fi
if [ "$HEALTH_OK" = "0" ] && curl -sf "http://127.0.0.1:${API_PORT}/health" >/dev/null; then
  echo "  UYARI: /api/health basarisiz ama /health calisiyor — nginx proxy_pass on ekini dusuruyor olabilir."
  echo "        Duzelt: proxy_pass http://127.0.0.1:${API_PORT}/api/;"
fi
echo ""
if [ "$OTURUM_OK" = "1" ]; then
  echo "Frontend guncellendi. Tarayicida Ctrl+Shift+R ile sert yenileme yapin."
else
  echo "Deploy tamamlandi ancak login API hazir degil — yukaridaki HATA satirlarini kontrol edin."
fi
echo ""
