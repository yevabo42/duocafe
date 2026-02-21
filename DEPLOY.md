# DuoCafé — Guía de Deploy CI/CD

## Flujo de ambientes

```
feature/* → develop  →  CI (unit tests) + Deploy DEV
                    ↓
              testing  →  CI (unit tests) + Deploy TESTING + Smoke tests
                    ↓
                 main  →  CI (unit tests) + Aprobación manual → Deploy PRODUCTION
```

### Ramas y ambientes

| Rama | Ambiente | Tests | Deploy |
|------|----------|-------|--------|
| `feature/*` | — | CI: type-check + unit tests | Solo CI, sin deploy |
| `develop` | DEV | unit tests | Automático |
| `testing` | TESTING | unit tests + smoke tests | Automático |
| `main` | PRODUCTION | unit tests | Manual (aprobación requerida) |

---

## 1. Configuración inicial del VPS (ya realizada)

El VPS `5.189.162.47` ya está configurado con:
- Docker + Docker Compose instalados
- Usuario `deploy` con acceso SSH por clave
- SSH key `~/.ssh/duocafe_deploy` instalada para `root` y `deploy`
- Alias locales: `ssh duocafe-staging`, `ssh duocafe-staging-deploy`
- Directorio `/opt/duocafe` preparado

Para acceder:
```bash
ssh duocafe-staging          # como root
ssh duocafe-staging-deploy   # como deploy
```

### 1.1 Preparar directorios de ambientes en el VPS

```bash
ssh duocafe-staging

# Crear estructura de directorios
mkdir -p /opt/duocafe/envs/{dev,testing,production}
mkdir -p /opt/duocafe/docker/{postgres/init,supabase}

# Copiar archivos desde el repositorio (tras el primer push)
cd /opt/duocafe
git clone https://github.com/OWNER/duocafe.git .
```

### 1.2 Subir archivos de configuracion

```bash
# Infraestructura compartida
scp docker-compose.infra.yml duocafe-staging:/opt/duocafe/
scp .env.infra duocafe-staging:/opt/duocafe/
scp docker/postgres/init/01_create_databases.sql duocafe-staging:/opt/duocafe/docker/postgres/init/
scp docker/postgres/postgresql.conf duocafe-staging:/opt/duocafe/docker/postgres/

# Ambientes
scp -r envs/dev duocafe-staging:/opt/duocafe/envs/
scp -r envs/testing duocafe-staging:/opt/duocafe/envs/
scp -r envs/production duocafe-staging:/opt/duocafe/envs/

# Scripts
scp scripts/deploy-env.sh duocafe-staging:/opt/duocafe/scripts/
chmod +x /opt/duocafe/scripts/deploy-env.sh   # en el VPS
```

### 1.3 Levantar infraestructura compartida (una sola vez)

```bash
ssh duocafe-staging

cd /opt/duocafe

# Crear red compartida
docker network create duocafe-infra

# Levantar PostgreSQL, Redis, Traefik, PgBouncer
docker compose -f docker-compose.infra.yml --env-file .env.infra up -d

# Verificar
docker compose -f docker-compose.infra.yml ps
```

---

## 2. GitHub Secrets requeridos

En **Settings → Secrets and variables → Actions** del repositorio:

### Secrets globales (infraestructura)

| Secret | Valor |
|--------|-------|
| `VPS_HOST` | `5.189.162.47` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Contenido de `~/.ssh/duocafe_deploy` (clave privada completa) |
| `VPS_PORT` | `22` |
| `GHCR_TOKEN` | PAT de GitHub con scope `read:packages` (para docker login en VPS) |

### Secrets de ambiente DEV

| Secret | Valor |
|--------|-------|
| `DEV_SUPABASE_URL` | `http://5.189.162.47:8002` |
| `DEV_SUPABASE_ANON_KEY` | Ver `envs/dev/.env` → `SUPABASE_ANON_KEY_DEV` |
| `DEV_API_URL` | `http://api-dev.5.189.162.47.nip.io` |

### Secrets de ambiente TESTING

| Secret | Valor |
|--------|-------|
| `TESTING_SUPABASE_URL` | `http://5.189.162.47:8003` |
| `TESTING_SUPABASE_ANON_KEY` | Ver `envs/testing/.env` → `SUPABASE_ANON_KEY_TESTING` |
| `TESTING_API_URL` | `http://api-test.5.189.162.47.nip.io` |

### Secrets de ambiente PRODUCTION

| Secret | Valor |
|--------|-------|
| `PROD_SUPABASE_URL` | `http://5.189.162.47:8001` |
| `PROD_SUPABASE_ANON_KEY` | Ver `envs/production/.env` → `SUPABASE_ANON_KEY_PROD` |
| `PROD_API_URL` | `http://api.5.189.162.47.nip.io` |

---

## 3. GitHub Environments (aprobacion manual en Production)

En **Settings → Environments**, crear tres entornos:

### `development`
- Sin restricciones
- Deploy automático desde `develop`

### `testing`
- Sin restricciones
- Deploy automático desde `testing`

### `production`
- **Required reviewers**: agregar tu usuario
- Deploy requiere aprobación manual
- Solo desde `main`

---

## 4. Workflow de desarrollo

```bash
# 1. Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/HU-01-auth-login

# 2. Desarrollar y hacer commits
git add .
git commit -m "feat: implementar login con email y password"
git push origin feature/HU-01-auth-login

# 3. CI se ejecuta automaticamente (type-check + unit tests)

# 4. Crear PR hacia develop en GitHub
# Al aprobar y mergear → deploy automatico a DEV

# 5. Cuando DEV esta estable, mergear develop → testing
git checkout testing
git merge develop
git push origin testing
# → Deploy automatico a TESTING + smoke tests

# 6. Cuando TESTING esta aprobado, mergear testing → main
git checkout main
git merge testing
git push origin main
# → Requiere aprobacion manual en GitHub
# → Al aprobar → deploy a PRODUCTION
```

---

## 5. Tags de imagenes Docker

| Ambiente | Tag de imagen |
|----------|--------------|
| DEV | `dev-sha-abc1234`, `dev-latest` |
| TESTING | `testing-sha-abc1234`, `testing-latest` |
| PRODUCTION | `sha-abc1234`, `production-latest`, `latest` |

Imagenes en GHCR:
```
ghcr.io/OWNER/duocafe-api:dev-sha-abc1234
ghcr.io/OWNER/duocafe-web:testing-latest
ghcr.io/OWNER/duocafe-api:latest  (produccion)
```

---

## 6. Deploy manual desde el VPS

```bash
ssh duocafe-staging

# Deploy al ambiente dev
IMAGE_TAG=dev-sha-abc1234 \
GHCR_OWNER=mi-usuario-github \
DEPLOY_DIR=/opt/duocafe \
  bash /opt/duocafe/scripts/deploy-env.sh dev

# Deploy al ambiente testing
IMAGE_TAG=testing-sha-abc1234 \
GHCR_OWNER=mi-usuario-github \
  bash /opt/duocafe/scripts/deploy-env.sh testing

# Deploy produccion
IMAGE_TAG=sha-abc1234 \
GHCR_OWNER=mi-usuario-github \
  bash /opt/duocafe/scripts/deploy-env.sh production
```

---

## 7. Rollback

```bash
ssh duocafe-staging

# Rollback a version anterior (usar tag del commit anterior)
IMAGE_TAG=dev-sha-ANTERIOR \
GHCR_OWNER=mi-usuario-github \
  bash /opt/duocafe/scripts/deploy-env.sh dev
```

O desde GitHub: hacer `git revert` y push a la rama correspondiente.

---

## 8. URLs por ambiente

| Ambiente | Web | API |
|----------|-----|-----|
| DEV | `http://dev.5.189.162.47.nip.io` | `http://api-dev.5.189.162.47.nip.io` |
| TESTING | `http://test.5.189.162.47.nip.io` | `http://api-test.5.189.162.47.nip.io` |
| PRODUCTION | `http://5.189.162.47.nip.io` | `http://api.5.189.162.47.nip.io` |

| Servicio | DEV | TESTING | PRODUCTION |
|----------|-----|---------|------------|
| Kong (API Gateway) | `:8002` | `:8003` | `:8001` |
| NestJS API | `:3002` | `:3003` | `:3001` |
| Web | `:4002` | `:4003` | `:4001` |
| Studio | `:54322` | `:54321` | `:54320` |
| Inbucket (email) | `:9001` | `:9002` | — |

---

## 9. Verificar estado de los servicios

```bash
ssh duocafe-staging

# Ver todos los contenedores
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Logs de un servicio especifico
docker compose -f /opt/duocafe/envs/dev/docker-compose.yml \
  --project-name duocafe-dev logs -f dev-api --tail=100

# Health check manual de la API
curl http://localhost:3002/api/v1/health   # dev
curl http://localhost:3003/api/v1/health   # testing
curl http://localhost:3001/api/v1/health   # production
```

---

## 10. Flujo completo del pipeline

```
Rama develop
     │
     ├─► [ci.yml] type-check + unit tests (en cada push)
     │
     └─► [deploy-dev.yml]
              ├── unit-tests (OBLIGATORIO)
              ├── build-api + build-web (paralelo)
              └── deploy (SSH → deploy-env.sh dev)
                       ↓
              DEV activo en el VPS

Rama testing (merge desde develop)
     │
     └─► [deploy-testing.yml]
              ├── unit-tests (OBLIGATORIO)
              ├── build-api + build-web (paralelo)
              ├── deploy (SSH → deploy-env.sh testing)
              └── smoke-tests (health check HTTP)
                       ↓
              TESTING activo en el VPS

Rama main (merge desde testing)
     │
     └─► [deploy-production.yml]
              ├── unit-tests (OBLIGATORIO)
              ├── build-api + build-web (paralelo)
              └── deploy [REQUIERE APROBACION MANUAL]
                   └── SSH → deploy-env.sh production
                            ↓
                   PRODUCTION activo en el VPS
```
