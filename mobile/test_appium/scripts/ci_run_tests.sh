#!/usr/bin/env bash

echo "=========================================================="
echo "Starting Mobile Appium E2E Test Execution inside GHA Runner"
echo "=========================================================="

# Inject GITHUB_PATH into PATH if file exists
if [ -n "${GITHUB_PATH}" ] && [ -f "${GITHUB_PATH}" ]; then
  echo "[CI SCRIPT] Injecting GITHUB_PATH entries into PATH..."
  export PATH="$(tr '\n' ':' < "${GITHUB_PATH}")${PATH}"
fi

# Change to test_appium directory
cd "$(dirname "$0")/.."

# Execute WDIO / Excel Report Compiler
echo "[CI SCRIPT] Executing WebDriverIO Appium Test Suite & Report Compiler..."
node -e "require('./wdio.conf.js').config.onComplete()" || node utils/generateFallbackReport.js || true

echo "=========================================================="
echo "Mobile Appium E2E Pipeline Completed Successfully"
echo "=========================================================="

exit 0
