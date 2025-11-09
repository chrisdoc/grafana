#!/usr/bin/env bash
set -euo pipefail

# Load environment variables from .env if not in CI
if [ -z "${CI:-}" ] && [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Check required variables
if [ -z "${GRAFANA_URL:-}" ] || [ -z "${GRAFANA_TOKEN:-}" ]; then
  echo "Error: GRAFANA_URL and GRAFANA_TOKEN must be set"
  exit 1
fi

# Remove trailing slash from GRAFANA_URL if present
GRAFANA_URL=${GRAFANA_URL%/}

# Test connection to Grafana
echo "Testing connection to Grafana..."
if ! curl -s -f -m 5 "${GRAFANA_URL}/api/health" > /dev/null 2>&1; then
  echo "Warning: Could not reach Grafana at ${GRAFANA_URL}"
  echo "Make sure Grafana is running and the URL is correct."
  echo ""
fi

# Function to upload a dashboard
upload_dashboard() {
  local file=$1
  local name=$(basename "$file" .json)
  
  echo "Uploading $name..."
  
  response=$(curl -s -w "\n%{http_code}" -X POST "${GRAFANA_URL}/api/dashboards/db" \
    -H "Authorization: Bearer ${GRAFANA_TOKEN}" \
    -H "Content-Type: application/json" \
    -d @"$file" 2>&1)
  
  # Split response and HTTP code
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -eq 200 ] || echo "$body" | grep -q '"status":"success"'; then
    echo "✓ Successfully uploaded $name"
    # Extract dashboard URL if available
    url=$(echo "$body" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$url" ]; then
      echo "  Dashboard URL: ${GRAFANA_URL}${url}"
    fi
  else
    echo "✗ Failed to upload $name (HTTP $http_code)"
    echo "  Response: $body"
    return 1
  fi
  echo ""
}

echo "Uploading dashboards to Grafana at ${GRAFANA_URL}..."
echo ""

failed=0
total=0

# Upload each dashboard
for dashboard in dist/*.json; do
  if [ -f "$dashboard" ]; then
    ((total++))
    if ! upload_dashboard "$dashboard"; then
      ((failed++))
    fi
  fi
done

if [ $total -eq 0 ]; then
  echo "No dashboards found in dist/"
  exit 1
fi

echo "Done! Uploaded $((total - failed))/$total dashboards successfully."

if [ $failed -gt 0 ]; then
  exit 1
fi
