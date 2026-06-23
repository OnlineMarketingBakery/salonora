#!/usr/bin/env bash
# Issue salonora.eu Let's Encrypt cert and point nginx at it.
# Run on the Ploi server as: sudo bash /tmp/omb-fix-salonora-ssl.sh
set -euo pipefail

DOMAIN="salonora.eu"
WEBROOT="/home/ploi/salonora.eu/public"
SSL_SNIPPET="/etc/nginx/ssl/${DOMAIN}"
ACME_BEFORE="/etc/nginx/ploi/${DOMAIN}/before/acme-http.conf"

echo "==> Ensure HTTP ACME challenge is reachable (no redirect to broken HTTPS)"
cat > "${ACME_BEFORE}" <<'EOF'
# Temporary / permanent: serve Let's Encrypt HTTP-01 challenges on port 80
server {
    listen 80;
    listen [::]:80;
    server_name salonora.eu www.salonora.eu;

    location ^~ /.well-known/acme-challenge/ {
        root /home/ploi/salonora.eu/public;
        allow all;
        auth_basic off;
        default_type "text/plain";
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
EOF

echo "==> Request certificate"
certbot certonly \
  --non-interactive \
  --agree-tos \
  --register-unsafely-without-email \
  --webroot -w "${WEBROOT}" \
  -d "${DOMAIN}"

echo "==> Point nginx SSL snippet at salonora.eu certificate"
cat > "${SSL_SNIPPET}" <<EOF
listen 443 ssl;
listen [::]:443 ssl;
http2 on;
ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
EOF

echo "==> Test and reload nginx"
nginx -t
systemctl reload nginx

echo "==> Done. Verify: curl -I https://${DOMAIN}/"
