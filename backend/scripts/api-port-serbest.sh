#!/usr/bin/env bash
# 3007 (veya API_PORT) uzerinde kalan dinleyiciyi serbest birakir.
# ss -tlnp PID gostermeyebilir (CloudPanel); fuser/lsof yedek kullanilir.
set -euo pipefail

API_PORT="${API_PORT:-3007}"
BACKEND_DIR="${BACKEND_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"

port_dinleniyor_mu() {
  ss -tln 2>/dev/null | grep -qE ":${API_PORT}[[:space:]]"
}

pids_on_port() {
  local port="$1"
  local pids=""

  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti ":${port}" 2>/dev/null | tr '\n' ' ' || true)"
  fi

  if [ -z "${pids// /}" ] && command -v ss >/dev/null 2>&1; then
    pids="$(
      ss -tlnp 2>/dev/null \
        | grep -E ":${port}[[:space:]]" \
        | grep -oE 'pid=[0-9]+' \
        | cut -d= -f2 \
        | sort -u \
        | tr '\n' ' ' \
        || true
    )"
  fi

  if [ -z "${pids// /}" ] && command -v fuser >/dev/null 2>&1; then
    pids="$(fuser "${port}/tcp" 2>/dev/null | tr -s ' ' '\n' | grep -E '^[0-9]+$' | tr '\n' ' ' || true)"
  fi

  echo "${pids// /}"
}

fuser_port_kapat() {
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${API_PORT}/tcp" 2>/dev/null || true
    return 0
  fi
  return 1
}

orphan_backend_node_kapat() {
  # PM2 durdurulduktan sonra CloudPanel'in biraktigi yetim node process
  if command -v pgrep >/dev/null 2>&1; then
    pgrep -af "${BACKEND_DIR}/dist/index.js" 2>/dev/null || true
    pkill -f "${BACKEND_DIR}/dist/index.js" 2>/dev/null || true
  fi
}

if ! port_dinleniyor_mu; then
  echo "  Port ${API_PORT} zaten bos."
  exit 0
fi

PIDS="$(pids_on_port "$API_PORT")"
if [ -n "$PIDS" ]; then
  echo "  Port ${API_PORT} kullanan PID(ler): ${PIDS}"
  for pid in $PIDS; do
    kill "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
  done
  sleep 1
fi

if port_dinleniyor_mu; then
  echo "  Port ${API_PORT} hala dolu — fuser ile kapatiliyor ..."
  fuser_port_kapat || true
  sleep 1
fi

if port_dinleniyor_mu; then
  echo "  Port ${API_PORT} hala dolu — yetim backend node araniyor ..."
  orphan_backend_node_kapat
  sleep 1
fi

if port_dinleniyor_mu; then
  echo "  UYARI: Port ${API_PORT} hala dolu."
  echo "  CloudPanel → Site → Node.js uygulamasini DURDURUN, sonra tekrar deneyin."
  ss -tln 2>/dev/null | grep ":${API_PORT}" || true
  exit 1
fi

echo "  Port ${API_PORT} serbest."
