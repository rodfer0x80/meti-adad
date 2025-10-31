#!/usr/bin/env bash
set -euo pipefail

CERT_DIR="./nginx/certs"
mkdir -p "$CERT_DIR"

DOMAIN="${1:-localhost}"   
DAYS_VALID=365

echo "Generating self-signed certificate for $DOMAIN ..."

openssl req -x509 -nodes -days $DAYS_VALID -newkey rsa:2048 \
  -keyout "$CERT_DIR/$DOMAIN.key" \
  -out "$CERT_DIR/$DOMAIN.crt" \
  -subj "/CN=$DOMAIN/O=adad/OU=dev"

echo "Certificate and key created in $CERT_DIR:"
la -lha $CERT_DIR
