#!/usr/bin/env bash
# Switch salonora.eu nginx from PHP/static to Node.js reverse proxy (port 3000).
# Run on the Ploi server: sudo bash src/lib/cms/fix-salonora-nginx-node.sh
set -euo pipefail

DOMAIN="salonora.eu"
SITE_CONF="/etc/nginx/sites-available/${DOMAIN}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="${SCRIPT_DIR}/salonora.eu-nginx-node.conf"

if [[ ! -f "${SOURCE}" ]]; then
  SOURCE="/tmp/salonora.eu-nginx-node.conf"
fi

if [[ ! -f "${SOURCE}" ]]; then
  echo "Missing nginx template: ${SOURCE}" >&2
  exit 1
fi

cp "${SOURCE}" "${SITE_CONF}"
nginx -t
systemctl reload nginx
echo "Done. Verify: curl -I https://${DOMAIN}/"
