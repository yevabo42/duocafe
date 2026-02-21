import json, os, hmac, hashlib, base64, struct, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
secrets = json.load(open(os.path.join(BASE, "scripts", "_secrets.json")))

DOMAIN = "5.189.162.47.nip.io"
GHCR   = "PLACEHOLDER_GITHUB_USER"
ACME   = "admin@duocafe.co"

ENVS = {
    "dev": {
        "redis_db": 2, "pg_db": "duocafe_dev",
        "node_env": "development", "log": "debug", "suffix": "DEV",
    },
    "testing": {
        "redis_db": 1, "pg_db": "duocafe_testing",
        "node_env": "test", "log": "debug", "suffix": "TESTING",
    },
    "production": {
        "redis_db": 0, "pg_db": "duocafe_production",
        "node_env": "production", "log": "info", "suffix": "PROD",
    },
}

# ── .env para infra compartida ─────────────────────
infra_env = f"""# DuoCafe - Infraestructura Compartida
DOMAIN={DOMAIN}
ACME_EMAIL={ACME}
TRAEFIK_DASHBOARD_AUTH=admin:$$2y$$05$$CHANGEME_RUN_htpasswd

POSTGRES_PASSWORD={secrets['SHARED_POSTGRES_PASS']}
POSTGRES_USER=postgres

REDIS_PASSWORD={secrets['SHARED_REDIS_PASS']}
"""
path = os.path.join(BASE, ".env.infra")
open(path, "w").write(infra_env)
print(f"OK .env.infra")

# ── .env por ambiente ─────────────────────────────
for env, cfg in ENVS.items():
    s   = secrets["envs"][env]
    sfx = cfg["suffix"]
    lines = [
        f"# DuoCafe - Ambiente: {env.upper()}",
        f"DOMAIN={DOMAIN}",
        f"ACME_EMAIL={ACME}",
        f"GHCR_OWNER={GHCR}",
        f"API_IMAGE=ghcr.io/{GHCR}/duocafe-api:latest",
        f"WEB_IMAGE=ghcr.io/{GHCR}/duocafe-web:latest",
        "",
        "# PostgreSQL (instancia compartida)",
        f"POSTGRES_PASSWORD={secrets['SHARED_POSTGRES_PASS']}",
        "",
        "# Redis (instancia compartida)",
        f"REDIS_PASSWORD={secrets['SHARED_REDIS_PASS']}",
        f"REDIS_DB={cfg['redis_db']}",
        "",
        "# Supabase JWT (exclusivo de este ambiente)",
        f"SUPABASE_JWT_SECRET_{sfx}={s['SUPABASE_JWT_SECRET']}",
        f"SUPABASE_ANON_KEY_{sfx}={s['SUPABASE_ANON_KEY']}",
        f"SUPABASE_SERVICE_ROLE_KEY_{sfx}={s['SUPABASE_SERVICE_ROLE_KEY']}",
        "",
        "# App",
        f"NODE_ENV={cfg['node_env']}",
        f"LOG_LEVEL={cfg['log']}",
    ]
    content = "\n".join(lines) + "\n"
    path = os.path.join(BASE, "envs", env, ".env")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w").write(content)
    print(f"OK envs/{env}/.env")

# ── Imprimir resumen de secrets para GitHub ────────
print("\n=== SECRETS PARA GITHUB ACTIONS ===")
print(f"DOMAIN={DOMAIN}")
print(f"POSTGRES_PASSWORD={secrets['SHARED_POSTGRES_PASS']}")
print(f"REDIS_PASSWORD={secrets['SHARED_REDIS_PASS']}")
for env, cfg in ENVS.items():
    s = secrets["envs"][env]
    sfx = cfg["suffix"]
    print(f"\n-- {env.upper()} --")
    print(f"SUPABASE_JWT_SECRET_{sfx}={s['SUPABASE_JWT_SECRET']}")
    print(f"SUPABASE_ANON_KEY_{sfx}={s['SUPABASE_ANON_KEY']}")
    print(f"SUPABASE_SERVICE_ROLE_KEY_{sfx}={s['SUPABASE_SERVICE_ROLE_KEY']}")
