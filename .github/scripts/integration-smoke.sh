#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/infrastructure/docker-compose.microservices.yml"

cleanup() {
  docker compose -f "$COMPOSE_FILE" down -v || true
}
trap cleanup EXIT

wait_for() {
  local name="$1"
  local url="$2"
  local attempts=40

  for _ in $(seq 1 "$attempts"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "[ok] $name is healthy"
      return 0
    fi
    sleep 2
  done

  echo "[error] $name did not become healthy: $url"
  docker compose -f "$COMPOSE_FILE" logs "$name" || true
  return 1
}

docker compose -f "$COMPOSE_FILE" up -d \
  postgres redis \
  backend-api ai-service matching-engine scraper automation \
  notifications analytics payments webhooks admin-panel

wait_for backend-api http://localhost:4000/health
wait_for ai-service http://localhost:8001/health
wait_for matching-engine http://localhost:8002/health
wait_for scraper http://localhost:8003/health
wait_for automation http://localhost:8004/health
wait_for notifications http://localhost:8005/health
wait_for analytics http://localhost:8006/health
wait_for payments http://localhost:8007/health
wait_for webhooks http://localhost:8008/health
wait_for admin-panel http://localhost:4100/health

echo "All services passed integration smoke checks."
