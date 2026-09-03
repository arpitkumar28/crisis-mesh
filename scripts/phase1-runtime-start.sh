#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

API_URL="${PHASE1_API_URL:-http://localhost:3002}"
MAX_ATTEMPTS="${PHASE1_READY_ATTEMPTS:-60}"

command -v docker >/dev/null 2>&1 || { echo "RUNTIME = BLOCKED: Docker is not installed" >&2; exit 1; }
docker info >/dev/null 2>&1 || { echo "RUNTIME = BLOCKED: Docker daemon is unavailable" >&2; exit 1; }

echo "Starting PostgreSQL and MQTT..."
docker compose up -d postgres mqtt

wait_for_container_health() {
  local service="$1" container_id health
  for ((attempt = 1; attempt <= MAX_ATTEMPTS; attempt++)); do
    container_id="$(docker compose ps -q "$service")"
    health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' "$container_id" 2>/dev/null || true)"
    [[ "$health" == "healthy" ]] && return 0
    if [[ "$health" == "unhealthy" || "$health" == "exited" ]]; then
      docker compose logs --tail=40 "$service" >&2 || true
      return 1
    fi
    printf 'Waiting for %s (%s/%s)\n' "$service" "$attempt" "$MAX_ATTEMPTS"
    sleep 1
  done
  return 1
}

wait_for_mqtt() {
  for ((attempt = 1; attempt <= MAX_ATTEMPTS; attempt++)); do
    nc -z localhost 1883 >/dev/null 2>&1 && return 0
    printf 'Waiting for MQTT TCP reachability (%s/%s)\n' "$attempt" "$MAX_ATTEMPTS"
    sleep 1
  done
  return 1
}

wait_for_http() {
  local endpoint="$1"
  for ((attempt = 1; attempt <= MAX_ATTEMPTS; attempt++)); do
    curl --fail --silent --show-error --max-time 2 "$endpoint" >/dev/null && return 0
    printf 'Waiting for API health (%s/%s)\n' "$attempt" "$MAX_ATTEMPTS"
    sleep 1
  done
  return 1
}

wait_for_container_health postgres || { echo "RUNTIME = BLOCKED: PostgreSQL did not become healthy" >&2; exit 1; }
wait_for_container_health mqtt || { echo "RUNTIME = BLOCKED: MQTT container did not become healthy" >&2; exit 1; }
wait_for_mqtt || { echo "RUNTIME = BLOCKED: MQTT is not reachable on localhost:1883" >&2; exit 1; }

if [[ -z "${JWT_SECRET:-}" ]]; then
  echo "RUNTIME = BLOCKED: JWT_SECRET must be provided outside source control" >&2
  exit 1
fi
export DATABASE_URL="${PHASE1_DATABASE_URL:-postgresql://crisis_mesh:crisis_mesh_password@localhost:5432/crisis_mesh}"
echo "Applying tracked database migrations..."
(cd services/api && npm run migration:run)

echo "Starting NestJS API..."
docker compose up -d --build api
wait_for_http "$API_URL/api/v1/health" || {
  docker compose logs --tail=60 api >&2 || true
  echo "RUNTIME = BLOCKED: $API_URL/api/v1/health did not return HTTP 200" >&2
  exit 1
}

echo "RUNTIME = READY"
echo "Next: cd services/api && npm run phase1:live"