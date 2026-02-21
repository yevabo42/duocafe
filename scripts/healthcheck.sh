#!/usr/bin/env bash
# =================================================
# DUOCAFE - Health Check de todos los servicios
# Uso: bash scripts/healthcheck.sh [staging]
# =================================================
set -euo pipefail

ENVIRONMENT="${1:-production}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/duocafe}"

cd "$DEPLOY_DIR"

if [[ "$ENVIRONMENT" == "staging" ]]; then
    COMPOSE_FILES="-f docker-compose.yml -f docker-compose.staging.yml"
else
    COMPOSE_FILES="-f docker-compose.yml"
fi

COMPOSE="docker compose --env-file .env $COMPOSE_FILES"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC} $*"; }
fail() { echo -e "  ${RED}✗${NC} $*"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $*"; }

echo "=== DuoCafé Health Check ($ENVIRONMENT) ==="
echo ""

ERRORS=0

check_service() {
    local name="$1"
    local container="$2"
    local url="$3"

    STATUS=$($COMPOSE ps --format json "$container" 2>/dev/null | \
        python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('Health','unknown'))" \
        2>/dev/null || echo "unknown")

    if $COMPOSE exec -T "$container" wget -qO- "$url" &>/dev/null 2>&1; then
        ok "$name (HTTP OK)"
    else
        fail "$name (no responde en $url)"
        ERRORS=$((ERRORS + 1))
    fi
}

# ─── Servicios de infraestructura ────────────────────
echo "Infraestructura:"
$COMPOSE exec -T supabase-db pg_isready -q \
    && ok "PostgreSQL" \
    || { fail "PostgreSQL"; ERRORS=$((ERRORS + 1)); }

$COMPOSE exec -T redis redis-cli -a "${REDIS_PASSWORD:-}" ping &>/dev/null \
    && ok "Redis" \
    || { fail "Redis"; ERRORS=$((ERRORS + 1)); }

$COMPOSE exec -T pgbouncer psql -h localhost -U "${POSTGRES_USER:-postgres}" \
    -d "${POSTGRES_DB:-postgres}" -c "SELECT 1" &>/dev/null \
    && ok "PgBouncer" \
    || { warn "PgBouncer (puede requerir auth)"; }

echo ""
echo "Supabase:"
check_service "GoTrue (Auth)"  "supabase-auth"    "http://localhost:9999/health"
check_service "PostgREST"      "supabase-rest"    "http://localhost:3000/"
check_service "Realtime"       "supabase-realtime" "http://localhost:4000/api/health"
check_service "Storage"        "supabase-storage"  "http://localhost:5000/status"
check_service "Meta"           "supabase-meta"     "http://localhost:8080/health"
check_service "Kong"           "supabase-kong"     "http://localhost:8000/rest/v1/"

echo ""
echo "Aplicacion:"
check_service "API (liveness)"  "nestjs-api" "http://localhost:3000/api/v1/health"
check_service "Web (Next.js)"   "nestjs-web" "http://localhost:3000"

# Worker y Scheduler (solo verificar que esten corriendo)
WORKER_STATUS=$($COMPOSE ps --format table worker 2>/dev/null | grep -c "Up" || echo 0)
SCHED_STATUS=$($COMPOSE ps --format table scheduler 2>/dev/null | grep -c "Up" || echo 0)
[[ $WORKER_STATUS -gt 0 ]] && ok "Worker (running)" || { fail "Worker (not running)"; ERRORS=$((ERRORS + 1)); }
[[ $SCHED_STATUS -gt 0 ]]  && ok "Scheduler (running)" || { fail "Scheduler (not running)"; ERRORS=$((ERRORS + 1)); }

echo ""
echo "Traefik:"
check_service "Traefik (API)"  "traefik" "http://localhost:8080/ping"

# ─── Resumen ─────────────────────────────────────────
echo ""
echo "============================="
if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}Todos los servicios: OK${NC}"
    exit 0
else
    echo -e "${RED}$ERRORS servicio(s) con problemas${NC}"
    echo ""
    echo "Ver logs:"
    echo "  docker compose logs -f nestjs-api"
    echo "  docker compose logs -f supabase-auth"
    exit 1
fi
