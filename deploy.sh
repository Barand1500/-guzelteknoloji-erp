#!/bin/bash
set -euo pipefail

# =============================================================================
# GÜZEL TEKNOLOJİ ERP — TEK DOSYA DEPLOY
# =============================================================================
#
# Sunucu klasör yapısı (CloudPanel / htdocs):
#
#   /home/guzelteknoloji-erp/htdocs/erp.guzelteknoloji.com/
#     deploy.sh          <- bu dosya (repo'dan otomatik kopyalanır)
#     repo/              <- git projesi
#     frontend/          <- nginx document root (Vite build çıktısı)
#     backend/           <- PM2 çalışma dizini (.env burada kalır)
#
# İlk kurulum:
#   cd ~/htdocs/erp.guzelteknoloji.com
#   git clone https://github.com/Barand1500/-guzelteknoloji-erp.git repo
#   cp repo/deploy.sh .
#   mkdir -p backend
#   cp repo/backend/.env.example backend/.env
#   nano backend/.env          # DATABASE_URL, JWT_SECRET, PORT=3006
#   chmod +x deploy.sh
#   ./deploy.sh
#
# Sonraki güncellemeler (git'ten son veriyi çeker):
#   cd ~/htdocs/erp.guzelteknoloji.com
#   ./deploy.sh
#
# Nginx (vhost) — /api ve /uploads Node'a gitmeli:
#   location /api/ {
#     proxy_pass http://127.0.0.1:3006/api/;
#     proxy_http_version 1.1;
#     proxy_set_header Host $host;
#     proxy_set_header X-Real-IP $remote_addr;
#     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#     proxy_set_header X-Forwarded-Proto $scheme;
#   }
#   location /uploads/ {
#     proxy_pass http://127.0.0.1:3006/uploads/;
#     proxy_set_header Host $host;
#   }
#
# Veritabanı sıfırlama (TÜM VERİ SİLİNİR):
#   DB_RESET=1 ./deploy.sh
#
# =============================================================================

# --- AYARLAR (sunucuya göre değiştir) ---
SITE="${DEPLOY_SITE:-$HOME/htdocs/erp.guzelteknoloji.com}"
GIT_REMOTE="https://github.com/Barand1500/-guzelteknoloji-erp.git"
GIT_BRANCH="main"
PM2_NAME="erp-api"
API_PORT="3006"
DB_RESET="${DB_RESET:-0}"
# ----------------------------------------

echo ""
echo "=== GÜZEL TEKNOLOJİ ERP — DEPLOY BAŞLIYOR ==="
echo "  Site : $SITE"
echo "  Branch: $GIT_BRANCH"
echo ""

# --- Git repo kontrolü ---
if [ ! -d "$SITE/repo/.git" ]; then
  echo "HATA: $SITE/repo klasöründe git projesi yok."
  echo ""
  echo "İlk kurulum:"
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
  echo "HATA: $SITE/backend/.env yok."
  echo "  cp $SITE/repo/backend/.env.example $SITE/backend/.env"
  echo "  nano $SITE/backend/.env"
  exit 1
fi

# [1/6] Git — origin'den son commit
echo "[1/6] Git güncelleniyor (origin/$GIT_BRANCH)..."
cd "$SITE/repo"
git fetch origin "$GIT_BRANCH"
git reset --hard "origin/$GIT_BRANCH"
cp "$SITE/repo/deploy.sh" "$SITE/deploy.sh"
chmod +x "$SITE/deploy.sh"
echo "  Son commit: $(git log -1 --oneline)"

# [2/6] Frontend build (Vite → frontend/)
echo "[2/6] Frontend build..."
cd "$SITE/repo"
npm ci
VITE_API_URL=/api npm run build
rsync -a --delete "$SITE/repo/frontend/" "$SITE/frontend/"
FRONTEND_JS="$(grep -oE 'index-[^"]+\.js' "$SITE/frontend/index.html" | head -1 || true)"
echo "  Çıktı: $SITE/frontend/ (${FRONTEND_JS:-?})"

# [3/6] Backend build (TypeScript → dist/)
echo "[3/6] Backend build..."
cd "$SITE/repo/backend"
npm ci
npm run build
rsync -a \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='uploads' \
  "$SITE/repo/backend/" "$SITE/backend/"
echo "  Çıktı: $SITE/backend/dist/"

# [4/6] Sunucu bağımlılıkları
echo "[4/6] Backend bağımlılıkları (production)..."
cd "$SITE/backend"
npm ci --omit=dev
chmod +x scripts/db-push-safe.sh 2>/dev/null || true

# [5/6] Veritabanı (Prisma)
echo "[5/6] Veritabanı..."
PRISMA_SCHEMA="$(bash scripts/prisma-sema.sh)"
echo "  Şema: $PRISMA_SCHEMA"
npx prisma generate --schema "$PRISMA_SCHEMA"
DB_OK=1
export DB_RESET
if bash scripts/db-push-safe.sh; then
  echo "  Veritabanı güncellendi."
else
  DB_OK=0
  echo ""
  echo "  UYARI: Veritabanı adımı başarısız — deploy devam ediyor (PM2 yenilenecek)."
  echo "  Manuel: cd $SITE/backend && bash scripts/db-push-safe.sh"
  echo "  Sıfır kurulum: DB_RESET=1 ./deploy.sh"
  echo ""
fi

# [6/6] PM2
echo "[6/6] PM2 ($PM2_NAME, port $API_PORT)..."
cd "$SITE/backend"
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME" --update-env
else
  pm2 start ecosystem.config.cjs
fi
pm2 save

# --- Sağlık kontrolü ---
echo ""
if [ "$DB_OK" = "1" ]; then
  echo "=== DEPLOY TAMAMLANDI ==="
else
  echo "=== DEPLOY TAMAMLANDI (veritabanı uyarısı var) ==="
fi

echo ""
echo "API kontrolleri (127.0.0.1:${API_PORT})..."
HEALTH_OK=0
OTURUM_OK=0

if curl -sf "http://127.0.0.1:${API_PORT}/api/health" >/dev/null; then
  HEALTH_OK=1
  echo "  OK  /api/health"
else
  echo "  HATA /api/health — log: pm2 logs ${PM2_NAME} --lines 30"
fi

if curl -sf "http://127.0.0.1:${API_PORT}/api/admin/auth/oturum-secenekleri" | grep -q '"firmalar"'; then
  OTURUM_OK=1
  echo "  OK  /api/admin/auth/oturum-secenekleri"
else
  echo "  HATA /api/admin/auth/oturum-secenekleri"
  echo "        Nginx: location /api/ { proxy_pass http://127.0.0.1:${API_PORT}/api/; }"
fi

echo ""
if [ "$OTURUM_OK" = "1" ]; then
  echo "Frontend güncellendi. Tarayıcıda Ctrl+Shift+R ile sert yenileme yapın."
else
  echo "Deploy bitti; login API hazır değilse yukarıdaki HATA satırlarını kontrol edin."
fi
echo ""
