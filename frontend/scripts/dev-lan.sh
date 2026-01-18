#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

LAN_NAME="$(scutil --get LocalHostName 2>/dev/null || hostname)"
LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")"

if [[ -n "$LAN_IP" ]]; then
  echo "Mobile URL (LAN IP):  http://$LAN_IP:5173"
fi

echo "Mobile URL (mDNS):   http://$LAN_NAME.local:5173"

if command -v qrencode >/dev/null 2>&1; then
  echo "QR (mDNS):"
  qrencode -t ANSIUTF8 "http://$LAN_NAME.local:5173"
  if [[ -n "$LAN_IP" ]]; then
    echo "QR (LAN IP):"
    qrencode -t ANSIUTF8 "http://$LAN_IP:5173"
  fi
else
  echo "Tip: install 'qrencode' to show QR codes."
  echo "macOS (Homebrew): brew install qrencode"
fi

echo "Starting Vite on 0.0.0.0:5173..."
cd "$FRONTEND_DIR"
./node_modules/.bin/vite --host 0.0.0.0 --port 5173
