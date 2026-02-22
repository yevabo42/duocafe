# =================================================
# DUOCAFE API - Multi-stage Dockerfile
# Targets: development | production
# =================================================

# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@10.30.1 --quiet

# ---- Dependencies ----
FROM base AS deps
# Copiar manifests del workspace para instalar dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile --filter @duocafe/api...

# ---- Builder ----
FROM deps AS builder
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/
# Compilar shared primero para que el deploy produzca JS (no TS)
WORKDIR /app
RUN pnpm --filter @duocafe/shared build
WORKDIR /app/apps/api
RUN pnpm run build
# pnpm deploy genera node_modules plano sin symlinks, apto para produccion
WORKDIR /app
RUN pnpm --filter @duocafe/api deploy --prod --legacy /prod

# ---- Development ----
FROM deps AS development
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "-r", "ts-node/register", "-r", "tsconfig-paths/register", "src/main.ts"]

# ---- Production ----
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /prod/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./

# Usuario no-root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/v1/health || exit 1

CMD ["node", "dist/main.js"]
