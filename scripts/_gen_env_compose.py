"""Genera docker-compose.yml para envs/testing y envs/production a partir del template de dev."""
import os, re

BASE  = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
DEV   = open(os.path.join(BASE, "envs", "dev", "docker-compose.yml")).read()

ENVS = {
    "testing": {
        "suffix": "TESTING", "redis_db": 1, "network": "duocafe-testing",
        "node_env": "test",
        "ports": {"rest": "8003", "api": "3003", "web": "4003",
                  "inbucket": "9002", "studio": "54321"},
        "rate": "rate-dev",
    },
    "production": {
        "suffix": "PROD", "redis_db": 0, "network": "duocafe-prod",
        "node_env": "production",
        "ports": {"rest": "8001", "api": "3001", "web": "4001",
                  "inbucket": None, "studio": "54320"},
        "rate": "rate-prod",
    },
}

for env, cfg in ENVS.items():
    sfx = cfg["suffix"]
    txt = DEV

    # Comentario de cabecera
    txt = re.sub(r'# DUOCAFE - Ambiente: DEVELOPMENT.*?=\n',
                 f'# DUOCAFE - Ambiente: {env.upper()}\n# =\n', txt, flags=re.DOTALL)

    # Reemplazar referencias dev → env
    txt = txt.replace("Ambiente: DEVELOPMENT", f"Ambiente: {env.upper()}")
    txt = txt.replace("duocafe_dev", f"duocafe_{env}")
    txt = txt.replace("duocafe-dev", f"duocafe-{env}")
    close = "}"
    txt = txt.replace("_DEV" + close, f"_{sfx}" + close)
    txt = txt.replace("duocafe-infra\n  duocafe-dev", f"duocafe-infra\n  duocafe-{env}")

    # Nombre de red
    txt = txt.replace(
        "duocafe-dev:\n    name: duocafe-dev",
        f"duocafe-{env}:\n    name: duocafe-{env}"
    )

    # Node env y redis_db
    txt = re.sub(r'NODE_ENV: development', f'NODE_ENV: {cfg["node_env"]}', txt)
    txt = re.sub(r'NODE_ENV: development', f'NODE_ENV: {cfg["node_env"]}', txt)
    txt = re.sub(r'REDIS_DB: 2', f'REDIS_DB: {cfg["redis_db"]}', txt)

    # Rate limit
    txt = txt.replace("rate-dev@docker", f'{cfg["rate"]}@docker')

    # Routers Traefik
    txt = re.sub(r'api-dev\.', f'api-{env}.', txt)
    txt = re.sub(r'supabase-dev\.', f'supabase-{env}.', txt)
    if env == "testing":
        txt = re.sub(r'Host\(`dev\.', 'Host(`test.', txt)
    else:
        txt = re.sub(r'Host\(`dev\.', 'Host(`', txt)

    # Puertos expuestos
    txt = re.sub(r'"8002:8000"', f'"{cfg["ports"]["rest"]}:8000"', txt)
    txt = re.sub(r'"3002:3000"', f'"{cfg["ports"]["api"]}:3000"', txt)
    txt = re.sub(r'"4002:3000"', f'"{cfg["ports"]["web"]}:3000"', txt)
    txt = re.sub(r'"54322:3000"', f'"{cfg["ports"]["studio"]}:3000"', txt)

    # Inbucket: en production eliminar, en testing cambiar puerto
    if cfg["ports"]["inbucket"]:
        txt = re.sub(r'"9001:9000"', f'"{cfg["ports"]["inbucket"]}:9000"', txt)
    else:
        # Eliminar servicio inbucket completo en production
        # Solo quitar el puerto y auto-confirm
        txt = re.sub(r'GOTRUE_MAILER_AUTOCONFIRM: "true"', 'GOTRUE_MAILER_AUTOCONFIRM: "false"', txt)
        txt = re.sub(r'"9001:9000".*\n', '', txt)
        txt = re.sub(r'- dev-inbucket\n', '', txt)

    # Log level en production
    if env == "production":
        txt = re.sub(r'LOG_LEVEL: debug', 'LOG_LEVEL: info', txt)

    out = os.path.join(BASE, "envs", env, "docker-compose.yml")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w").write(txt)
    print(f"OK envs/{env}/docker-compose.yml")
