#!/usr/bin/env bash
# 3007 (veya API_PORT) uzerinde kalan eski node dinleyicisini serbest birakir.
# CloudPanel + PM2 cakismasinda EADDRINUSE onler.
set -euo pipefail

API_PORT="${API_PORT:-3007}"

pids_on_port() {
  local port="$1"
  local pids=""

  if command -v ss >/dev/null 2>&1; then
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

  if [ -z "${pids// /}" ] && command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti ":${port}" 2>/dev/null | tr '\n' ' ' || true)"
  fi

  echo "${pids// /}"
}

PIDS="$(pids_on_port "$API_PORT")"
if [ -z "$PIDS" ]; then
  exit 0
fi

echo "  Port ${API_PORT} kullanan PID(ler): ${PIDS}"
for pid in $PIDS; do
  kill "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
done

sleep 1
REMAINING="$(pids_on_port "$API_PORT")"
if [ -n "$REMAINING" ]; then
  echo "  UYARI: Port ${API_PORT} hala dolu (PID: ${REMAINING})"
  exit 1
fi

echo "  Port ${API_PORT} serbest."
