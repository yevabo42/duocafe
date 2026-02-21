#!/usr/bin/env bash
# ==========================================================
# DUOCAFE - Deploy a un ambiente especifico
# Ejecutado por GitHub Actions via SSH
#
# Uso: bash deploy-env.sh <dev|testing|production>
#
# Variables de entorno esperadas:
#   IMAGE_TAG    - Tag de imagen (ej: dev-sha-abc1234)
#   GHCR_OWNER   - Owner del repo en GitHub
#   DEPLOY_DIR   - Directorio raiz del proyecto (default: /opt/duocafe)
# ==========================================================
set -euo pipefail

# ─── Argumentos ──────────────────────────────────────────
TARGET_ENV="${1:-}"
if [[ -z "$TARGET_ENV" ]]; then
    echo "ERROR: Especificar ambiente: dev | testing | production" >&2
    exit 1
fi

if [[ ! "$TARGET_ENV" =~ ^(dev|testing|production)$ ]]; then
    echo "ERROR: Ambiente invalido '$TARGET_ENV'. Usar: dev, testing, production" >&2
    exit 1
fi

# ─── Variables ───────────────────────────────────────────
DEPLOY_DIR="${DEPLOY_DIR:-/opt/duocafe}"
IMAGE_TAG="${IMAGE_TAG:?Variable IMAGE_TAG requerida}"
GHCR_OWNER="${GHCR_OWNER:?Variable GHCR_OWNER requerida}"
ENV_DIR="$DEPLOY_DIR/envs/$TARGET_ENV"
MAX_WAIT=120

# ─── Helpers ─────────────────────────────────────────────
log()  { echo "[$(date '+%H:%M:%S')] $*"; }
ok()   { echo "    OK: $*"; }
warn() { echo "  WARN: $*"; }
err()  { echo " ERROR: $*" >&2; exit 1; }

# ─── Prefijo de servicios por ambiente ───────────────────
case "$TARGET_ENV" in
    dev)        SVC_PREFIX="dev-";        DB_NAME="duocafe_dev" ;;
    testing)    SVC_PREFIX="testing-";    DB_NAME="duocafe_testing" ;;
    production) SVC_PREFIX="production-"; DB_NAME="duocafe_production" ;;
esac

# ─── Validaciones ────────────────────────────────────────
[[ -d "$ENV_DIR" ]] || err "Directorio no encontrado: $ENV_DIR"
[[ -f "$ENV_DIR/.env" ]] || err ".env no encontrado en $ENV_DIR"
[[ -f "$ENV_DIR/docker-compose.yml" ]] || err "docker-compose.yml no encontrado en $ENV_DIR"

log "==================================================="
log "DuoCafe Deploy -> $TARGET_ENV"
log "Image tag: $IMAGE_TAG"
log "GHCR owner: $GHCR_OWNER"
log "==================================================="

# ─── Compose command ────────────────────────────────────
COMPOSE="docker compose -f $ENV_DIR/docker-compose.yml --env-file $ENV_DIR/.env --project-name duocafe-$TARGET_ENV"

# ─── Inyectar IMAGE_TAG en el env del compose ────────────
# docker compose lee variables del env del proceso actual
export IMAGE_TAG
export GHCR_OWNER

# ─── Actualizar IMAGE_TAG en .env del ambiente ───────────
log "Actualizando variables de imagen en $ENV_DIR/.env..."

# Funcion para setear o actualizar una var en el .env
set_env_var() {
    local key="$1" val="$2" file="$3"
    if grep -q "^${key}=" "$file" 2>/dev/null; then
        sed -i "s|^${key}=.*|${key}=${val}|" "$file"
    else
        echo "${key}=${val}" >> "$file"
    fi
}

set_env_var "IMAGE_TAG"  "$IMAGE_TAG"  "$ENV_DIR/.env"
set_env_var "GHCR_OWNER" "$GHCR_OWNER" "$ENV_DIR/.env"
set_env_var "API_IMAGE"  "ghcr.io/${GHCR_OWNER}/duocafe-api:${IMAGE_TAG}"  "$ENV_DIR/.env"
set_env_var "WEB_IMAGE"  "ghcr.io/${GHCR_OWNER}/duocafe-web:${IMAGE_TAG}"  "$ENV_DIR/.env"

ok "Variables de imagen actualizadas (tag: $IMAGE_TAG)"

# ─── Pull imagenes ───────────────────────────────────────
log "Descargando imagenes desde GHCR..."
# Pull solo los servicios de la aplicacion (ignora errores de servicios que no existen)
for svc in "${SVC_PREFIX}api" "${SVC_PREFIX}web" "${SVC_PREFIX}worker" "${SVC_PREFIX}scheduler"; do
    $COMPOSE pull "$svc" 2>/dev/null && ok "  Descargado: $svc" || warn "  Omitido (no existe): $svc"
done
ok "Pull de imagenes completado"

# ─── Levantar servicios del ambiente ────────────────────
log "Iniciando stack $TARGET_ENV..."
$COMPOSE up -d --remove-orphans
ok "Servicios iniciados"

# ─── Esperar que la DB este lista ───────────────────────
log "Esperando PostgreSQL (base: $DB_NAME)..."
WAITED=0
until docker compose \
    -f "$DEPLOY_DIR/docker-compose.infra.yml" \
    --env-file "$DEPLOY_DIR/.env.infra" \
    exec -T postgres \
    pg_isready -d "$DB_NAME" -q 2>/dev/null; do
    sleep 2
    WAITED=$((WAITED + 2))
    if [[ $WAITED -ge 60 ]]; then
        warn "Timeout esperando la base de datos (puede estar ya lista)"
        break
    fi
done
ok "Base de datos lista"

# ─── Esperar que GoTrue inicialice el schema auth ────────
# GoTrue crea auth.users al arrancar; las migraciones dependen de esta tabla
log "Esperando GoTrue (schema auth)..."
WAITED=0
until $COMPOSE exec -T ${SVC_PREFIX}auth wget -qO- http://localhost:9999/health &>/dev/null; do
    sleep 5
    WAITED=$((WAITED + 5))
    if [[ $WAITED -ge 120 ]]; then
        warn "GoTrue no respondio en 120s, continuando de todas formas"
        break
    fi
done
ok "GoTrue listo"

# ─── Ejecutar migraciones ────────────────────────────────
log "Aplicando migraciones SQL a $DB_NAME..."
MIGRATIONS_DIR="$DEPLOY_DIR/database/migrations"

if [[ -d "$MIGRATIONS_DIR" ]] && ls "$MIGRATIONS_DIR"/*.sql &>/dev/null; then
    # Crear tabla de tracking si no existe
    docker compose \
        -f "$DEPLOY_DIR/docker-compose.infra.yml" \
        --env-file "$DEPLOY_DIR/.env.infra" \
        exec -T postgres \
        psql -U postgres -d "$DB_NAME" -c \
        "CREATE TABLE IF NOT EXISTS public._migrations (
            name TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ DEFAULT NOW()
         );" 2>/dev/null || true

    for migration in "$MIGRATIONS_DIR"/*.sql; do
        migname=$(basename "$migration")

        APPLIED=$(docker compose \
            -f "$DEPLOY_DIR/docker-compose.infra.yml" \
            --env-file "$DEPLOY_DIR/.env.infra" \
            exec -T postgres \
            psql -U postgres -d "$DB_NAME" -tAc \
            "SELECT COUNT(*) FROM public._migrations WHERE name='$migname'" 2>/dev/null || echo "0")

        if [[ "${APPLIED:-0}" -eq 0 ]]; then
            log "  Aplicando: $migname"
            docker compose \
                -f "$DEPLOY_DIR/docker-compose.infra.yml" \
                --env-file "$DEPLOY_DIR/.env.infra" \
                exec -T postgres \
                psql -U postgres -d "$DB_NAME" \
                < "$migration" && \
            docker compose \
                -f "$DEPLOY_DIR/docker-compose.infra.yml" \
                --env-file "$DEPLOY_DIR/.env.infra" \
                exec -T postgres \
                psql -U postgres -d "$DB_NAME" -c \
                "INSERT INTO public._migrations (name) VALUES ('$migname') ON CONFLICT DO NOTHING;" \
                2>/dev/null || warn "Error en $migname"
        else
            ok "  Ya aplicada: $migname"
        fi
    done
else
    warn "No se encontraron migraciones en $MIGRATIONS_DIR"
fi
ok "Migraciones completadas"

# ─── Health check ────────────────────────────────────────
log "Verificando salud de los servicios..."

# Determinar puerto del API segun ambiente
case "$TARGET_ENV" in
    dev)        API_PORT=3002 ;;
    testing)    API_PORT=3003 ;;
    production) API_PORT=3001 ;;
esac

API_HEALTHY=true
WAITED=0
while [[ $WAITED -lt $MAX_WAIT ]]; do
    if curl -sf "http://localhost:${API_PORT}/api/v1/health" > /dev/null 2>&1; then
        ok "API $TARGET_ENV: healthy (puerto $API_PORT)"
        break
    fi
    sleep 3
    WAITED=$((WAITED + 3))
    if [[ $WAITED -ge $MAX_WAIT ]]; then
        warn "API $TARGET_ENV no respondio en ${MAX_WAIT}s"
        API_HEALTHY=false
    fi
done

# ─── Limpiar imagenes viejas ────────────────────────────
docker image prune -f --filter "until=48h" > /dev/null 2>&1 || true
ok "Limpieza de imagenes completada"

# ─── Resumen ─────────────────────────────────────────────
echo ""
echo "==================================================="
echo "  Deploy $TARGET_ENV completado!"
echo "==================================================="
echo "  Image tag:  $IMAGE_TAG"
echo "  API status: $([ "$API_HEALTHY" = "true" ] && echo "OK" || echo "WARNING")"
echo ""
case "$TARGET_ENV" in
    dev)
        echo "  URLs:"
        echo "    Web: http://dev.5.189.162.47.nip.io"
        echo "    API: http://api-dev.5.189.162.47.nip.io"
        ;;
    testing)
        echo "  URLs:"
        echo "    Web: http://test.5.189.162.47.nip.io"
        echo "    API: http://api-test.5.189.162.47.nip.io"
        ;;
    production)
        echo "  URLs:"
        echo "    Web: http://5.189.162.47.nip.io"
        echo "    API: http://api.5.189.162.47.nip.io"
        ;;
esac
echo ""
