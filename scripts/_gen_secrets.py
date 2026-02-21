import secrets, base64, json, hmac, hashlib, struct, time, os, sys

def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def make_jwt(payload: dict, secret: str) -> str:
    header = b64url(json.dumps({"alg":"HS256","typ":"JWT"}).encode())
    body   = b64url(json.dumps(payload).encode())
    msg    = f"{header}.{body}".encode()
    sig    = hmac.new(secret.encode(), msg, hashlib.sha256).digest()
    return f"{header}.{body}.{b64url(sig)}"

def gen_password(n=32) -> str:
    alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return ''.join(secrets.choice(alpha) for _ in range(n))

def gen_hex(n=32) -> str:
    return secrets.token_hex(n)

def gen_jwt_pair(secret: str, iss: str = "supabase"):
    exp = 1893456000  # 2030-01-01
    anon = make_jwt({"role": "anon",         "iss": iss, "exp": exp, "iat": int(time.time())}, secret)
    svc  = make_jwt({"role": "service_role", "iss": iss, "exp": exp, "iat": int(time.time())}, secret)
    return anon, svc

# ── Generar secrets por ambiente ──────────────────────
envs = {}
SHARED_POSTGRES_PASS = gen_password(24)
SHARED_REDIS_PASS    = gen_password(24)
REALTIME_ENC_KEY     = gen_hex(16)   # 32 chars hex

for env in ["dev", "testing", "production"]:
    jwt_secret = gen_hex(32)          # 64 chars hex
    anon_key, svc_key = gen_jwt_pair(jwt_secret)
    envs[env] = {
        "POSTGRES_PASSWORD":                SHARED_POSTGRES_PASS,
        "REDIS_PASSWORD":                   SHARED_REDIS_PASS,
        "SUPABASE_JWT_SECRET":              jwt_secret,
        "SUPABASE_ANON_KEY":               anon_key,
        "SUPABASE_SERVICE_ROLE_KEY":       svc_key,
        "SUPABASE_REALTIME_ENC_KEY":       REALTIME_ENC_KEY,
        "SUPABASE_REALTIME_SECRET_KEY_BASE": gen_hex(32),
    }

# ── Imprimir ──────────────────────────────────────────
result = {
    "SHARED_POSTGRES_PASS": SHARED_POSTGRES_PASS,
    "SHARED_REDIS_PASS":    SHARED_REDIS_PASS,
    "envs": envs,
}
print(json.dumps(result, indent=2))
