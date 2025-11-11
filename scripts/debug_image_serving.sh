#!/usr/bin/env bash
set -eo pipefail

# DEBUG IMAGE SERVING
# Usage: ./scripts/debug_image_serving.sh /path/to/app filename.jpg https://example.com
# Example: ./scripts/debug_image_serving.sh /var/www/lacuisine 1762880512_taFWrYl7.jpg https://lacuisinebenson.com

APP_PATH=${1:-}
FILENAME=${2:-}
DOMAIN=${3:-}

if [ -z "$APP_PATH" ] || [ -z "$FILENAME" ] || [ -z "$DOMAIN" ]; then
  echo "Usage: $0 /path/to/app filename.jpg https://your.domain"
  exit 1
fi

PUBLIC_PATH="$APP_PATH/public/images/$FILENAME"
STORAGE_PATH="$APP_PATH/storage/app/public/images/$FILENAME"

echo "--- Debugging image serving for: $FILENAME ---"
echo "App path: $APP_PATH"

echo
printf "%s\n" "Checking public path: $PUBLIC_PATH"
if [ -e "$PUBLIC_PATH" ]; then
  echo "[FOUND] $PUBLIC_PATH"
  ls -l "$PUBLIC_PATH"
  echo "Stat (owner:group perms):"
  stat -c "%U:%G %a" "$PUBLIC_PATH" || stat -f "%Su:%Sg %Lp" "$PUBLIC_PATH" 2>/dev/null || true
else
  echo "[MISSING] $PUBLIC_PATH"
fi

echo
printf "%s\n" "Checking storage path: $STORAGE_PATH"
if [ -e "$STORAGE_PATH" ]; then
  echo "[FOUND] $STORAGE_PATH"
  ls -l "$STORAGE_PATH"
  echo "Stat (owner:group perms):"
  stat -c "%U:%G %a" "$STORAGE_PATH" || stat -f "%Su:%Sg %Lp" "$STORAGE_PATH" 2>/dev/null || true
else
  echo "[MISSING] $STORAGE_PATH"
fi

# Show storage link status
echo
if [ -L "$APP_PATH/public/storage" ]; then
  echo "public/storage symlink exists -> $(readlink -f "$APP_PATH/public/storage")"
else
  echo "public/storage symlink does NOT exist"
fi

# curl the public URL
echo
URL="$DOMAIN/images/$FILENAME"
echo "Requesting URL: $URL"
if command -v curl >/dev/null 2>&1; then
  echo "--- curl -I output ---"
  curl -I --location --max-time 10 "$URL" || true
  echo
  echo "--- curl -v (brief) ---"
  # limit verbose output to relevant lines
  curl -s -D - --location --max-time 10 "$URL" -o /dev/null || true
else
  echo "curl not installed on this machine"
fi

# Find common Apache error log paths
echo
echo "Looking for Apache error logs..."
LOGPATHS=("/var/log/apache2/error.log" "/var/log/httpd/error_log" "/var/log/apache2/other_vhosts_access.log")
FOUND_LOG=""
for p in "${LOGPATHS[@]}"; do
  if [ -f "$p" ]; then
    FOUND_LOG="$p"
    break
  fi
done

if [ -n "$FOUND_LOG" ]; then
  echo "Found Apache log: $FOUND_LOG"
  echo "--- Last 80 lines from $FOUND_LOG ---"
  # try to tail without sudo; if permission denied, suggest sudo
  if tail -n 80 "$FOUND_LOG" 2>/dev/null; then
    true
  else
    echo "Could not read $FOUND_LOG (permission denied). Try running this script with sudo or paste output of: sudo tail -n 80 $FOUND_LOG"
  fi
else
  echo "No common Apache error log found in standard locations. Check your distro's log path."
fi

# Optional SELinux check
if command -v getenforce >/dev/null 2>&1; then
  echo
  echo "SELinux status: $(getenforce)"
fi

echo
echo "--- End debug report ---"

exit 0
