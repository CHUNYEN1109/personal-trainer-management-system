#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"

for test_file in performance-tests/smoke/client/*.js performance-tests/smoke/trainer/*.js; do
  k6 run \
    -e BASE_URL="$BASE_URL" \
    "$test_file"
done
