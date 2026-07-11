#!/usr/bin/env bash
# API smoke test — sunucuda: cd backend && bash scripts/api-smoke.sh
set -euo pipefail
cd "$(dirname "$0")/.."

API_PORT="${API_PORT:-3006}"
BASE="http://127.0.0.1:${API_PORT}"

mock_auth() {
  if [ -f .env ]; then
    grep -E '^MOCK_AUTH=' .env | cut -d= -f2- | tr -d ' "' | tr '[:upper:]' '[:lower:]'
  fi
}

echo "==> ERP API smoke test (${BASE})"
echo "    MOCK_AUTH=$(mock_auth || echo '?')"
echo ""

check_get() {
  local path="$1"
  local expect="${2:-}"
  local raw code body
  raw="$(curl -sS -w $'\nHTTP_CODE:%{http_code}' "${BASE}${path}" 2>/dev/null || echo $'\nHTTP_CODE:000')"
  code="${raw##*HTTP_CODE:}"
  body="${raw%HTTP_CODE:*}"
  body="$(echo "$body" | tr -d '\r')"

  if [ -n "$expect" ] && echo "$body" | grep -q "$expect" && [ "$code" = "200" ]; then
    echo "  OK   GET ${path} (HTTP ${code})"
    return 0
  fi

  echo "  FAIL GET ${path} (HTTP ${code})"
  if [ -n "$body" ]; then
    echo "       $(echo "$body" | head -c 160)"
  fi
  return 1
}

# Korunan route var mi? Token olmadan 401 beklenir (404 = route eksik).
check_auth_route() {
  local path="$1"
  local raw code body
  raw="$(curl -sS -w $'\nHTTP_CODE:%{http_code}' "${BASE}${path}" 2>/dev/null || echo $'\nHTTP_CODE:000')"
  code="${raw##*HTTP_CODE:}"
  body="${raw%HTTP_CODE:*}"
  body="$(echo "$body" | tr -d '\r')"

  if [ "$code" = "401" ]; then
    echo "  OK   GET ${path} (HTTP ${code} — route mevcut)"
    return 0
  fi

  if [ "$code" = "404" ] && echo "$body" | grep -q 'Endpoint bulunamadi'; then
    echo "  FAIL GET ${path} (HTTP 404 — route eksik, ./deploy.sh yeniden calistirin)"
    if [ -n "$body" ]; then
      echo "       $(echo "$body" | head -c 160)"
    fi
    return 1
  fi

  echo "  FAIL GET ${path} (HTTP ${code}, beklenen 401)"
  if [ -n "$body" ]; then
    echo "       $(echo "$body" | head -c 160)"
  fi
  return 1
}

FAIL=0
check_get "/api/health" '"durum"' || FAIL=1
HEALTH="$(curl -sS "${BASE}/api/health" 2>/dev/null || true)"
if echo "$HEALTH" | grep -q '"dbTuru":"erp"'; then
  echo "  OK   dbTuru=erp"
else
  echo "  WARN dbTuru erp degil: ${HEALTH}"
  FAIL=1
fi
check_get "/health" '"durum"' || FAIL=1
check_get "/api/admin/auth/oturum-secenekleri" '"firmalar"' || FAIL=1
check_get "/admin/auth/oturum-secenekleri" '"firmalar"' || FAIL=1

echo ""
echo "Protected routes (401 = OK, 404 = eksik backend build):"
check_auth_route "/api/admin/kullanicilar" || FAIL=1
check_auth_route "/api/admin/tanimlar/firmalar" || FAIL=1
check_auth_route "/api/admin/tanimlar/donemler" || FAIL=1
check_auth_route "/api/admin/tanimlar/subeler" || FAIL=1
check_auth_route "/api/admin/roller" || FAIL=1

echo ""
if [ "$FAIL" = "0" ]; then
  echo "All checks passed."
else
  echo "Some checks failed."
  echo ""
  echo "Hints:"
  echo "  pm2 logs erp-api --lines 40"
  echo "  grep MOCK_AUTH .env   # production: MOCK_AUTH=0"
  echo "  ls -la dist/routes/auth.js dist/routes/tanimlar.js"
  echo "  pm2 delete erp-api; pm2 start ecosystem.config.cjs; pm2 save"
  exit 1
fi
