#!/usr/bin/env bash
# =================================================
# DUOCAFE - Setup inicial del VPS
# Ejecutar UNA sola vez como root o con sudo
#
# Uso: bash setup-vps.sh [staging|production]
# =================================================
set -euo pipefail

ENVIRONMENT="${1:-staging}"
DEPLOY_USER="deploy"
DEPLOY_DIR="/opt/duocafe"
REPO_URL="${REPO_URL:-}"  # Pasar como variable de entorno

log() { echo "[$(date '+%H:%M:%S')] $*"; }
ok()  { echo "  ✓ $*"; }
err() { echo "  ✗ ERROR: $*" >&2; exit 1; }

# ─── Verificaciones ─────────────────────────────────
[[ $EUID -eq 0 ]] || err "Ejecutar como root: sudo bash setup-vps.sh"
command -v apt-get &>/dev/null || err "Solo compatible con Ubuntu/Debian"

log "=== DuoCafé VPS Setup ($ENVIRONMENT) ==="

# ─── Actualizar sistema ──────────────────────────────
log "Actualizando paquetes del sistema..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
    curl wget git vim ufw fail2ban \
    ca-certificates gnupg lsb-release \
    htop jq unzip
ok "Paquetes del sistema actualizados"

# ─── Docker Engine ───────────────────────────────────
log "Instalando Docker Engine..."
if command -v docker &>/dev/null; then
    ok "Docker ya instalado: $(docker --version)"
else
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
        > /etc/apt/sources.list.d/docker.list

    apt-get update -qq
    apt-get install -y -qq \
        docker-ce docker-ce-cli containerd.io \
        docker-buildx-plugin docker-compose-plugin

    systemctl enable --now docker
    ok "Docker instalado: $(docker --version)"
    ok "Docker Compose: $(docker compose version)"
fi

# ─── Usuario de deploy ────────────────────────────────
log "Configurando usuario de deploy..."
if id "$DEPLOY_USER" &>/dev/null; then
    ok "Usuario '$DEPLOY_USER' ya existe"
else
    useradd -m -s /bin/bash "$DEPLOY_USER"
    usermod -aG docker "$DEPLOY_USER"
    ok "Usuario '$DEPLOY_USER' creado y agregado al grupo docker"
fi

# Configurar SSH para el usuario deploy
DEPLOY_HOME="/home/$DEPLOY_USER"
mkdir -p "$DEPLOY_HOME/.ssh"
chmod 700 "$DEPLOY_HOME/.ssh"
touch "$DEPLOY_HOME/.ssh/authorized_keys"
chmod 600 "$DEPLOY_HOME/.ssh/authorized_keys"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_HOME/.ssh"
ok "Directorio SSH configurado para '$DEPLOY_USER'"

echo ""
echo "  IMPORTANTE: Agrega la clave publica de GitHub Actions:"
echo "  >> Copia el contenido de tu clave publica y ejecuta:"
echo "  echo 'ssh-ed25519 AAAA...' >> $DEPLOY_HOME/.ssh/authorized_keys"
echo ""

# ─── Directorio del proyecto ─────────────────────────
log "Creando directorio del proyecto..."
mkdir -p "$DEPLOY_DIR"
chown "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_DIR"
ok "Directorio creado: $DEPLOY_DIR"

# Clonar o configurar el repo
if [[ -n "$REPO_URL" ]]; then
    if [[ -d "$DEPLOY_DIR/.git" ]]; then
        ok "Repositorio ya existe, omitiendo clone"
    else
        sudo -u "$DEPLOY_USER" git clone "$REPO_URL" "$DEPLOY_DIR"
        ok "Repositorio clonado"
    fi
fi

# ─── Archivo .env ────────────────────────────────────
if [[ ! -f "$DEPLOY_DIR/.env" ]]; then
    log "Creando archivo .env desde template..."
    if [[ -f "$DEPLOY_DIR/.env.example" ]]; then
        cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
        chown "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_DIR/.env"
        chmod 600 "$DEPLOY_DIR/.env"
        ok ".env creado — EDITAR con los valores reales antes de iniciar"
    else
        log "Advertencia: .env.example no encontrado. Crear .env manualmente."
    fi
else
    ok ".env ya existe"
fi

# ─── Firewall UFW ─────────────────────────────────────
log "Configurando firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# En staging: exponer puertos de debugging
if [[ "$ENVIRONMENT" == "staging" ]]; then
    ufw allow 8000/tcp comment "Supabase Kong (staging)"
    ufw allow 54323/tcp comment "Supabase Studio (staging)"
    ufw allow 9000/tcp comment "Inbucket Email UI (staging)"
    ufw allow 5432/tcp comment "PostgreSQL (staging)"
fi

ufw --force enable
ok "Firewall configurado (UFW)"

# ─── Fail2ban ─────────────────────────────────────────
log "Configurando fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = ssh
filter = sshd
maxretry = 5
bantime = 3600
findtime = 600
EOF
systemctl enable --now fail2ban
ok "fail2ban configurado"

# ─── Swap (si hay menos de 4GB RAM) ──────────────────
TOTAL_RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
if [[ $TOTAL_RAM_KB -lt 4194304 ]] && [[ ! -f /swapfile ]]; then
    log "Configurando 2GB de swap..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    ok "Swap de 2GB configurado"
fi

# ─── Logrotate para Docker ────────────────────────────
cat > /etc/logrotate.d/docker-containers << 'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    delaycompress
    copytruncate
}
EOF
ok "Logrotate para Docker configurado"

# ─── Resumen ─────────────────────────────────────────
echo ""
echo "================================================="
echo "  VPS Setup completado!"
echo "================================================="
echo ""
echo "  Entorno:   $ENVIRONMENT"
echo "  Usuario:   $DEPLOY_USER"
echo "  Directorio: $DEPLOY_DIR"
echo ""
echo "  Proximos pasos:"
echo "  1. Agregar clave SSH publica en $DEPLOY_HOME/.ssh/authorized_keys"
echo "  2. Editar $DEPLOY_DIR/.env con los valores reales"
echo "  3. Hacer login al registry GHCR:"
echo "     sudo -u $DEPLOY_USER docker login ghcr.io"
echo "  4. Ejecutar el primer deploy manualmente:"
echo "     sudo -u $DEPLOY_USER bash $DEPLOY_DIR/scripts/deploy.sh"
echo ""
