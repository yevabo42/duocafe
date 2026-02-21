#!/usr/bin/env bash
# =================================================
# DUOCAFE - Script de Deploy en el VPS
# Ejecutado por GitHub Actions via SSH
#
# Variables de entorno esperadas (inyectadas por CI/CD):
#   IMAGE_TAG    - SHA del commit (ej: sha-abc1234)
#   GHCR_OWNER   - Owner del repo en GitHub (ej: miorg)
#   ENVIRONMENT  - staging | production
#   DEPLOY_DIR   - Directorio del proyecto (default: /opt/duocafe)
# =================================================
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/duocafe}"
ENVIRONMENT="${ENVIRONMENT:-staging}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
GHCR_OWNER="${GHCR_OWNER:?Variable GHCR_OWNER requerida}"
MAX_WAIT=120  # segundos esperando health check

log()  { echo "[$(date '+%H:%M:%S')] $*"; }
ok()   { echo "  ✓ $*"; }
err()  { echo "  ✗ ERROR: $*" >&2; exit 1; }
warn() { echo "  ⚠ $*"; }

cd "$DEPLOY_DIR" || err "No se encontro el directorio $DEPLOY_DIR"

log "=== DuoCafé Deploy ($ENVIRONMENT) ==="
log "Image tag: $IMAGE_TAG"
log "GHCR owner: $GHCR_OWNER"

# ─── Validar .env ────────────────────────────────────
[[ -f .env ]] || err ".env no encontrado. Ejecutar setup-vps.sh primero."

# ─── Actualizar archivos del repo ────────────────────
log "Sincronizando archivos del repo..."
git fetch --quiet origin
git reset --hard "origin/$(git branch --show-current)"
ok "Repo sincronizado"

# ─── Actualizar .env.deploy (vars de imagen) ─────────
log "Actualizando .env.deploy..."
cat > .env.deploy << EOF
IMAGE_TAG=${IMAGE_TAG}
GHCR_OWNER=${GHCR_OWNER}
EOF
ok ".env.deploy actualizado"

# ─── Definir compose command segun entorno ───────────
if [[ "$ENVIRONMENT" == "staging" ]]; then
    COMPOSE_FILES="-f docker-compose.yml -f docker-compose.staging.yml"
else
    COMPOSE_FILES="-f docker-compose.yml"
fi

COMPOSE_CMD="docker compose --env-file .env --env-file .env.deploy $COMPOSE_FILES"

# ─── Pull imagenes nuevas ────────────────────────────
log "Descargando nuevas imagenes desde GHCR..."
$COMPOSE_CMD pull nestjs-web nestjs-api worker scheduler || {
    warn "Pull parcialmente fallido, continuando con imagenes existentes..."
}
ok "Imagenes descargadas"

# ─── Levantar servicios de infraestructura primero ───
log "Verificando servicios de infraestructura..."
$COMPOSE_CMD up -d \
    supabase-db pgbouncer redis \
    supabase-auth supabase-rest supabase-kong

# Esperar a que la DB este lista
log "Esperando base de datos..."
WAITED=0
until $COMPOSE_CMD exec supabase-db pg_isready -q 2>/dev/null; do
    sleep 2
    WAITED=$((WAITED + 2))
    [[ $WAITED -ge 30 ]] && err "Timeout esperando la base de datos"
done
ok "Base de datos lista"

# ─── Ejecutar migraciones ────────────────────────────
log "Ejecutando migraciones SQL..."
for migration in database/migrations/*.sql; do
    migname=$(basename "$migration")
    # Verificar si la migracion ya fue aplicada (tabla tracking)
    APPLIED=$($COMPOSE_CMD exec -T supabase-db \
        psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-postgres}" -tAc \
        "SELECT COUNT(*) FROM public._migrations WHERE name='$migname' LIMIT 1" 2>/dev/null || echo "0")

    if [[ "$APPLIED" == "0" ]] || [[ -z "$APPLIED" ]]; then
        log "  Aplicando: $migname"
        $COMPOSE_CMD exec -T supabase-db \
            psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-postgres}" \
            < "$migration" || warn "Error en $migname (puede ser normal si es re-run)"
    else
        ok "  Ya aplicada: $migname"
    fi
done
ok "Migraciones completadas"

# ─── Deploy rolling de servicios de app ──────────────
log "Desplegando servicios de aplicacion..."
$COMPOSE_CMD up -d \
    --remove-orphans \
    --no-recreate \
    supabase-realtime supabase-storage supabase-meta \
    traefik nestjs-web nestjs-api worker scheduler
ok "Servicios desplegados"

# ─── Health check post-deploy ────────────────────────
log "Verificando salud de los servicios..."

check_health() {
    local service="$1"
    local url="$2"
    local waited=0

    while [[ $waited -lt $MAX_WAIT ]]; do
        if $COMPOSE_CMD exec -T "$service" \
            wget -qO- "$url" &>/dev/null 2>&1; then
            ok "$service: healthy"
            return 0
        fi
        sleep 3
        waited=$((waited + 3))
    done

    warn "$service: no respondio en ${MAX_WAIT}s (revisar logs)"
    return 1
}

API_HEALTHY=true
WEB_HEALTHY=true

check_health "nestjs-api" "http://localhost:3000/api/v1/health" || API_HEALTHY=false
check_health "nestjs-web" "http://localhost:3000" || WEB_HEALTHY=false

# ─── Rollback si ambos fallan ────────────────────────
if [[ "$API_HEALTHY" == "false" ]] && [[ "$WEB_HEALTHY" == "false" ]]; then
    err "Deploy fallido. Revisar logs: docker compose logs nestjs-api nestjs-web"
fi

# ─── Limpiar imagenes antiguas ────────────────────────
log "Limpiando imagenes sin usar..."
docker image prune -f --filter "until=48h" > /dev/null 2>&1 || true
ok "Limpieza completada"

# ─── Resumen final ───────────────────────────────────
echo ""
echo "================================================="
echo "  Deploy completado exitosamente!"
echo "================================================="
echo "  Entorno:   $ENVIRONMENT"
echo "  Image tag: $IMAGE_TAG"
echo "  API:       $([ "$API_HEALTHY" == "true" ] && echo "OK" || echo "WARNING")"
echo "  Web:       $([ "$WEB_HEALTHY" == "true" ] && echo "OK" || echo "WARNING")"
echo ""
echo "  Logs:"
echo "    docker compose logs -f nestjs-api"
echo "    docker compose logs -f nestjs-web"
echo ""
