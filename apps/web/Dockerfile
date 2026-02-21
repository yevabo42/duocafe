# =================================================
# DUOCAFE WEB - Multi-stage Dockerfile
# Next.js 14 PWA (standalone output)
# =================================================

# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@latest --quiet

# ---- Dependencies ----
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile --filter @duocafe/web... 2>/dev/null \
    || pnpm install --filter @duocafe/web...

# ---- Builder ----
FROM deps AS builder

# Build args: variables publicas de Next.js (se hornean en el bundle)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

WORKDIR /app/apps/web

# Activar output standalone para imagen minima
RUN echo "output: 'standalone'" >> next.config.js 2>/dev/null || true
RUN pnpm run build

# ---- Production ----
FROM node:20-alpine AS production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

WORKDIR /app

# Usuario no-root
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copiar solo lo necesario del build standalone
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health 2>/dev/null || \
      wget -qO- http://localhost:3000 > /dev/null || exit 1

CMD ["node", "apps/web/server.js"]
