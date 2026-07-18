#!/usr/bin/env bash
set -euo pipefail

# Renk Tanımlamaları (Terminal çıktısı için)
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfigürasyon
SITE="${DEPLOY_SITE:-$HOME/htdocs/erp.guzelteknoloji.com}"
GIT_BRANCH="main"
PM2_NAME="erp-api"
API_PORT="3007"
DB_RESET="${DB_RESET:-0}"
PUBLIC_URL="${PUBLIC_URL:-https://erp.guzelteknoloji.com}"
FRONTEND_MOCK_AUTH="${FRONTEND_MOCK_AUTH:-0}"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[UYARI]${NC} $1"; }
log_error() { echo -e "${RED}[HATA]${NC} $1"; exit 1; }


echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}    GUZEL TEKNOLOJI ERP DEPLOYMENT (V2)    ${NC}"
echo -e "${GREEN}===========================================${NC}"

# Klasör Kontrolleri
[ -d "$SITE/repo/.git" ] || log_error "Missing git repo at $SITE/repo. Lütfen ilk kurulumu yapın."
[ -f "$SITE/backend/.env" ] || log_error "Eksik dosya: $SITE/backend/.env"

# 1. GIT GÜNCELLEME & DEĞİŞİKLİK ANALİZİ
log_info "Git güncelleniyor ve değişiklikler analiz ediliyor..."
cd "$SITE/repo"
git fetch origin "$GIT_BRANCH"

# Akıllı Kontroller: Hangi dosyalar değişti?
DEPS_CHANGED=$(git diff --name-only HEAD "origin/$GIT_BRANCH" | grep -E 'package\.json|package-lock\.json' || true)
PRISMA_CHANGED=$(git diff --name-only HEAD "origin/$GIT_BRANCH" | grep -E "schema.prisma|prisma-sema.sh" || true)

git reset --hard "origin/$GIT_BRANCH"
cp "$SITE/repo/deploy.sh" "$SITE/deploy.sh" && chmod +x "$SITE/deploy.sh"
log_success "Git güncellendi. Commit: $(git log -1 --oneline)"

# 2. FRONTEND BUILD
log_info "Frontend kontrol ediliyor..."
if [ -n "$DEPS_CHANGED" ] || [ ! -d "$SITE/repo/node_modules" ]; then
    log_warn "Bağımlılıklar değişmiş, repo kökünde npm ci yapılıyor..."
    npm ci --quiet
else
    log_success "Frontend bağımlılıkları güncel."
fi

if [ "$FRONTEND_MOCK_AUTH" = "1" ]; then
    VITE_API_URL=/api VITE_BACKEND_YOK=true npx vite build --emptyOutDir
else
    VITE_API_URL=/api VITE_BACKEND_YOK=false npx vite build --emptyOutDir
fi

rsync -a --delete "$SITE/repo/frontend/" "$SITE/frontend/"
log_success "Frontend hazır ve taşındı."

# 3. BACKEND BUILD
log_info "Backend hazirlaniyor..."
cd "$SITE/repo/backend"

# Build her zaman tam devDependencies ile yapilir; repo build alani prune edilmez
npm ci --quiet
npm run build

# Canli klasore kod ve dist tasinir; node_modules ayri kurulur
log_info "Backend canli klasore senkronize ediliyor..."
rsync -a --delete \
  --exclude='.env' \
  --exclude='uploads' \
  --exclude='node_modules' \
  "$SITE/repo/backend/" "$SITE/backend/"

cd "$SITE/backend"
log_info "Canli backend production bagimliliklari kuruluyor..."
npm ci --omit=dev --quiet

# 4. DATABASE SENKRONİZASYONU
log_info "Veritabanı işlemleri..."
cd "$SITE/backend"
chmod +x scripts/*.sh 2>/dev/null || true

PRISMA_SCHEMA="$(bash scripts/prisma-sema.sh)"

if [ -n "$PRISMA_CHANGED" ] || [ ! -d "$SITE/backend/node_modules/.prisma" ]; then
    log_warn "Prisma şeması değişmiş veya eksik, yeniden generate ediliyor..."
    npx prisma generate --schema "$PRISMA_SCHEMA"
else
    log_success "Prisma şeması güncel, generate adımı atlandı."
fi

export DB_RESET
if bash scripts/db-push-safe.sh; then
    log_success "Veritabanı senkronize edildi."
    
    # Hatalı parantez blokları yerine temiz, düz akışa geçildi
    log_info "Database seed işlemi başlatılıyor..."
    set +e
    export $(grep -v '^#' "$SITE/backend/.env" | xargs) 2>/dev/null || true
    set -e
    bash scripts/db-seed.sh
    log_success "Seed işlemi tamamlandı."
else
    log_warn "Veritabanı adımı başarısız oldu, deploy devam ediyor."
fi

# 5. PM2 RESTART (Kesintisiz / Zero-Downtime)
log_info "PM2 servisi güncelleniyor..."
if ! command -v pm2 >/dev/null 2>&1; then
    npm install -g pm2 --quiet
fi

if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
    log_info "PM2 mevcut süreç yenileniyor (Reload)..."
    pm2 reload ecosystem.config.cjs --update-env
else
    log_info "Yeni PM2 süreci başlatılıyor..."
    pm2 start ecosystem.config.cjs
fi
pm2 save

log_success "PM2 servisi güncellendi."
# 6. SAĞLIK KONTROLLERİ
echo ""
echo -e "${GREEN}=== SAĞLIK KONTROLLERİ ===${NC}"

check_endpoint() {
    local url=$1
    local expected_code=$2
    local name=$3
    local code
    code=$(curl -sS -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo "000")

    log_info "Sağlık kontrolü yapılıyor... $url"
    if [ "$code" = "$expected_code" ]; then
        echo -e "  [${GREEN}OK${NC}] $name (HTTP $code)"
        return 0
    else
        echo -e "  [${RED}FAIL${NC}] $name (Beklenen: $expected_code, Gelen: $code)"
        return 1
    fi
}

check_endpoint "http://127.0.0.1:${API_PORT}/api/health" "200" "Yerel API Sağlık Durumu" || true
check_endpoint "http://127.0.0.1:${API_PORT}/api/admin/auth/oturum-secenekleri" "200" "Oturum Seçenekleri" || true
check_endpoint "${PUBLIC_URL}/api/health" "200" "Dış Dünya API Erişimi" || true

echo ""
echo -e "${GREEN}🚀 DEPLOY TAMAMLANDI!${NC}"