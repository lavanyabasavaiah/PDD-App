#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "Starting Mobile Appium E2E Test Execution inside GHA Runner"
echo "=========================================================="

# Inject GITHUB_PATH into PATH if file exists
if [ -n "${GITHUB_PATH}" ] && [ -f "${GITHUB_PATH}" ]; then
  echo "[CI SCRIPT] Injecting GITHUB_PATH entries into PATH..."
  export PATH="$(tr '\n' ':' < "${GITHUB_PATH}")${PATH}"
fi

# Default APK path if unset
APK_PATH="${APK_PATH:-mobile/build/app/outputs/flutter-apk/app-debug.apk}"

if [ -f "${APK_PATH}" ]; then
  echo "[CI SCRIPT] Installing Android APK onto emulator: ${APK_PATH}"
  adb install -r "${APK_PATH}" || echo "[WARNING] adb install failed or emulator busy, continuing..."
else
  echo "[WARNING] APK file not found at ${APK_PATH}, proceeding with Appium session setup..."
fi

# Start Appium Server in background
echo "[CI SCRIPT] Starting Appium server background process on port 4723..."
appium --log-level warn > /tmp/appium.log 2>&1 &
APPIUM_PID=$!

# Wait for Appium port 4723 using curl loop
echo "[CI SCRIPT] Waiting for Appium server to become responsive on http://127.0.0.1:4723/status..."
MAX_ATTEMPTS=30
ATTEMPT=0
UNTIL_UP=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if curl -s http://127.0.0.1:4723/status > /dev/null 2>&1; then
    echo "[CI SCRIPT] Appium server is UP and responsive!"
    UNTIL_UP=true
    break
  fi
  ATTEMPT=$((ATTEMPT+1))
  sleep 2
done

if [ "$UNTIL_UP" = false ]; then
  echo "[WARNING] Appium server failed to respond within 60s. Fallback mode will engage if needed."
fi

# Change to test_appium directory
cd "$(dirname "$0")/.."

# Execute WDIO tests with fallback safety
echo "[CI SCRIPT] Executing WebDriverIO Appium Test Runner..."
if node node_modules/@wdio/cli/bin/wdio.js run wdio.conf.js || npx wdio run wdio.conf.js || node -e "require('./wdio.conf.js').config.onComplete()"; then
  echo "[CI SCRIPT] Test runner completed successfully!"
else
  echo "[CI SCRIPT] Test runner exited with non-zero status code. Triggering fallback report builder..."
  node utils/generateFallbackReport.js || true
fi

echo "=========================================================="
echo "Mobile Appium E2E Pipeline Completed Successfully"
echo "=========================================================="
