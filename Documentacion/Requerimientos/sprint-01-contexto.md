# DuoCafe — Sprint 1: Contexto de Desarrollo

**Duracion:** 2 semanas
**Objetivo:** Establecer la fundacion tecnica completa del proyecto — infraestructura Docker, autenticacion de consumidor y acceso al panel admin. Al finalizar este sprint, cualquier desarrollador puede hacer login en la plataforma y existe la base sobre la que se construira todo lo demas.

**Historias cubiertas:** HU-1.1, HU-1.2, HU-1.3, HU-1.5, HU-12.3, HU-13.1, HU-13.2, HU-13.3

---

## 1. Historias de Usuario del Sprint

### HU-13.1 — PWA Instalable

**Criterios de aceptacion:**
- La web app cumple criterios PWA: `manifest.json`, service worker, iconos
- Banner "Agregar a pantalla de inicio" aparece en movil
- Se abre en modo standalone (sin barra del navegador) una vez instalada
- Icono de DuoCafe visible en pantalla de inicio del dispositivo
- Funciona offline para contenido ya cargado (caching de shell)
- Splash screen con branding DuoCafe al abrir la app instalada

**Lo que se construye:**
- `manifest.json` con nombre, iconos, colores, `display: standalone`
- Service Worker con estrategia cache-first para shell de la app
- Set completo de iconos PNG (72x72 hasta 512x512)
- Configuracion Next.js para PWA (`next-pwa`)

---

### HU-13.2 — Responsive Design

**Criterios de aceptacion:**
- Diseno mobile-first en todos los componentes
- Breakpoints: movil (< 640px), tablet (640-1024px), desktop (> 1024px)
- Todas las funcionalidades del sprint son accesibles en cualquier tamano
- Navegacion: bottom tab bar en movil, sidebar en desktop
- Panel admin: optimizado para desktop, funcional en tablet

**Lo que se construye:**
- Sistema de layout base con Tailwind CSS
- Componente `AppShell` con navegacion responsive
- `BottomNav` para movil, `Sidebar` para desktop
- Tokens de diseno: colores DuoCafe, tipografia, espaciado

---

### HU-13.3 — Rendimiento y Carga

**Criterios de aceptacion:**
- First Contentful Paint (FCP) < 2 segundos en 4G
- Lighthouse score > 80 en Performance
- Imagenes con lazy loading y formatos modernos (WebP/AVIF)
- Skeleton screens mientras carga contenido
- Transiciones suaves entre pantallas

**Lo que se construye:**
- Configuracion de Next.js Image (`next/image` con WebP automatico)
- Componentes Skeleton reutilizables
- Configuracion de Lighthouse en CI (umbral > 80)
- Animaciones base con Tailwind (`transition`, `animate-pulse` para skeletons)

---

### HU-1.1 — Registro con Email y Contrasena

**Criterios de aceptacion:**
- El usuario ingresa nombre, email y contrasena
- Email debe ser unico en el sistema
- Contrasena minimo 8 caracteres
- Se envia email de verificacion
- No puede acceder a funciones protegidas sin verificar email
- Mensaje de error claro si el email ya esta registrado
- Se almacena la fecha de registro

**Lo que se construye:**
- Pagina `/register` en Next.js con formulario validado (react-hook-form + zod)
- Integracion con `supabase.auth.signUp()` (Supabase GoTrue self-hosted)
- Pantalla "Revisa tu email" despues del registro
- Trigger en PostgreSQL: crear `user_profiles` automaticamente al registrar usuario en `auth.users`
- Validacion de contrasena fuerte (min 8 chars, al menos 1 numero)
- Toast de error si email ya existe

---

### HU-1.2 — Login con Email y Contrasena

**Criterios de aceptacion:**
- El usuario ingresa email y contrasena
- Si credenciales correctas: login exitoso y redireccion al home
- Si incorrectas: mensaje de error generico (seguridad — no indicar cual campo fallo)
- Sesion persistente con JWT + refresh token
- Opcion "Olvide mi contrasena" visible

**Lo que se construye:**
- Pagina `/login` en Next.js con formulario
- Integracion con `supabase.auth.signInWithPassword()`
- Manejo de sesion via Supabase SSR helpers (`@supabase/ssr`)
- Middleware de Next.js para proteger rutas autenticadas
- Redireccion inteligente: si intenta ir a ruta protegida sin auth → redirige a `/login`, luego de autenticar → ruta original

---

### HU-1.3 — Recuperacion de Contrasena

**Criterios de aceptacion:**
- El usuario ingresa su email
- Recibe enlace de restablecimiento por email (expira en 1 hora)
- Puede establecer nueva contrasena
- Se invalidan sesiones anteriores al cambiar contrasena

**Lo que se construye:**
- Pagina `/forgot-password` con campo de email
- Pagina `/reset-password` que recibe el token de Supabase por URL
- Integracion con `supabase.auth.resetPasswordForEmail()` y `supabase.auth.updateUser()`
- Configuracion del template de email en GoTrue (SMTP)

---

### HU-1.5 — Logout

**Criterios de aceptacion:**
- Opcion de cerrar sesion accesible desde el perfil/menu
- Se invalida el token de sesion
- Se redirige a la pantalla de login

**Lo que se construye:**
- Boton de logout en el menu/header
- Integracion con `supabase.auth.signOut()`
- Limpieza de cache de sesion en Redis (via llamada a NestJS)
- Redireccion a `/login`

---

### HU-12.3 — Login de Admin y Marca

**Criterios de aceptacion:**
- Login separado para panel admin en web
- Roles: `platform_admin` (DuoCafe), `brand_admin` (La Rosa)
- Cada rol ve solo las secciones que le corresponden
- Super Admin puede crear cuentas de Admin Marca
- Sesion con timeout por inactividad (30 min)

**Lo que se construye:**
- Ruta `/admin/login` separada de la app de consumidor
- Verificacion de rol al autenticar: si `role !== 'platform_admin' && role !== 'brand_admin'` → acceso denegado
- Layout del panel admin con navegacion lateral por rol
- Middleware de Next.js para rutas `/admin/**` y `/brand/**`
- Timeout de sesion: hook que detecta inactividad y ejecuta logout

---

## 2. Arquitectura del Sprint

### 2.1 Servicios activos al finalizar Sprint 1

```
Traefik (puerto 80/443)
│
├── /              → Next.js PWA (consumidor + auth)
├── /admin         → Next.js PWA (panel admin)
├── api.*          → NestJS API (solo /health activo en Sprint 1)
└── supabase.*     → Supabase Kong (auth + GoTrue)

Servicios Docker corriendo:
- traefik
- nextjs-web (Next.js)
- nestjs-api (NestJS — solo /health)
- supabase-db (PostgreSQL 15)
- supabase-auth (GoTrue)
- supabase-kong (API Gateway)
- supabase-rest (PostgREST)
- supabase-meta
- supabase-studio
- pgbouncer
- redis
```

### 2.2 Flujo de autenticacion en Sprint 1

```
[Formulario Next.js]
       │
       │ supabase.auth.signInWithPassword()
       │
       ▼
[Supabase GoTrue] ──── PostgreSQL (auth.users)
       │
       │ JWT (access_token + refresh_token)
       │
       ▼
[Middleware Next.js] ── Valida JWT con Supabase
       │
       ├─ /consumer/** → requiere role: consumer
       ├─ /admin/**    → requiere role: platform_admin
       └─ /brand/**    → requiere role: brand_admin
```

### 2.3 Flujo de creacion de user_profiles (trigger)

```sql
-- Cuando auth.users inserta un usuario nuevo:
CREATE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    display_name,
    referral_code,
    role
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    upper(substring(gen_random_uuid()::text from 1 for 8)),
    COALESCE(NEW.raw_app_meta_data->>'role', 'consumer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 3. Setup del Proyecto (desde cero)

### 3.1 Prerequisitos

```bash
# Herramientas necesarias en la maquina de desarrollo
node >= 20.0.0
pnpm >= 9.0.0
docker >= 24.0
docker compose >= 2.24
flutter >= 3.19 (solo para apps/mobile, no requerido Sprint 1)
git
```

### 3.2 Inicializar el Monorepo

```bash
# Crear directorio del proyecto
mkdir duocafe && cd duocafe
git init

# Inicializar workspace pnpm
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# Package.json raiz
cat > package.json << 'EOF'
{
  "name": "duocafe",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
EOF

# Instalar Turborepo
pnpm install

# turbo.json
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
EOF
```

### 3.3 Crear la App Next.js (PWA)

```bash
# Crear app Next.js
cd apps
pnpm create next-app@latest web \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --no-experimental-app \
  --import-alias "@/*"

cd web

# Instalar dependencias
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add react-hook-form @hookform/resolvers zod
pnpm add zustand
pnpm add sonner                           # toast notifications
pnpm add next-pwa                         # PWA support
pnpm add @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-slot
pnpm add class-variance-authority clsx tailwind-merge
pnpm add lucide-react                     # iconos

pnpm add -D @types/node @types/react @types/react-dom
```

### 3.4 Crear la API NestJS

```bash
cd apps
pnpm add -g @nestjs/cli
nest new api --package-manager pnpm

cd api

# Dependencias del Sprint 1 (solo health + auth validation)
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport
pnpm add passport passport-jwt
pnpm add @supabase/supabase-js
pnpm add ioredis
pnpm add @nestjs/terminus           # health checks
pnpm add helmet
pnpm add class-validator class-transformer
pnpm add pino-http                  # logging estructurado

pnpm add -D @types/passport @types/passport-jwt @types/ioredis
```

### 3.5 Crear el Paquete Compartido

```bash
mkdir -p packages/shared/src
cd packages/shared

cat > package.json << 'EOF'
{
  "name": "@duocafe/shared",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
EOF

# Tipos base que se necesitan en Sprint 1
cat > src/types/user.types.ts << 'EOF'
export type UserRole = 'consumer' | 'brand_admin' | 'platform_admin' | 'producer';

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: UserRole;
  brand_id: string | null;
  level: number;
  level_title: string;
  total_granos: number;
  cerezas_balance: number;
  referral_code: string;
  onboarding_completed: boolean;
  created_at: string;
}

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  brand_id: string | null;
  display_name: string;
}
EOF

cat > src/types/api.types.ts << 'EOF'
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
EOF

cat > src/index.ts << 'EOF'
export * from './types/user.types';
export * from './types/api.types';
EOF
```

---

## 4. Estructura de Archivos a Crear

### 4.1 Next.js Web App (`apps/web`)

```
apps/web/
├── public/
│   ├── manifest.json
│   ├── sw.js                         # generado por next-pwa
│   └── icons/
│       ├── icon-72x72.png
│       ├── icon-96x96.png
│       ├── icon-128x128.png
│       ├── icon-144x144.png
│       ├── icon-152x152.png
│       ├── icon-192x192.png
│       ├── icon-384x384.png
│       └── icon-512x512.png
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout con providers
│   │   ├── page.tsx                  # Landing / redirect al home o login
│   │   │
│   │   ├── (auth)/                   # Grupo de rutas sin nav principal
│   │   │   ├── layout.tsx            # Layout minimalista para auth
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # HU-1.2
│   │   │   ├── register/
│   │   │   │   └── page.tsx          # HU-1.1
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx          # HU-1.3 (paso 1)
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx          # HU-1.3 (paso 2)
│   │   │   └── verify-email/
│   │   │       └── page.tsx          # Pantalla "revisa tu email"
│   │   │
│   │   ├── (consumer)/               # Rutas del consumidor (requieren auth)
│   │   │   ├── layout.tsx            # AppShell con bottom nav + sidebar
│   │   │   └── home/
│   │   │       └── page.tsx          # Placeholder Sprint 1
│   │   │
│   │   ├── (admin)/                  # Panel admin (requiere role: platform_admin)
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # HU-12.3 - login admin
│   │   │   └── dashboard/
│   │   │       └── page.tsx          # Placeholder Sprint 1
│   │   │
│   │   └── (brand)/                  # Panel marca (requiere role: brand_admin)
│   │       ├── layout.tsx
│   │       └── dashboard/
│   │           └── page.tsx          # Placeholder Sprint 1
│   │
│   ├── components/
│   │   ├── ui/                       # Componentes base del design system
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── card.tsx
│   │   │   ├── skeleton.tsx          # HU-13.3
│   │   │   ├── toast.tsx             # via sonner
│   │   │   └── loading-spinner.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── forgot-password-form.tsx
│   │   │   └── reset-password-form.tsx
│   │   │
│   │   └── layout/
│   │       ├── app-shell.tsx         # HU-13.2 - layout responsive
│   │       ├── bottom-nav.tsx        # navegacion movil
│   │       ├── sidebar.tsx           # navegacion desktop
│   │       └── admin-sidebar.tsx     # navegacion admin
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Supabase browser client
│   │   │   └── server.ts             # Supabase server client (RSC + Server Actions)
│   │   ├── utils.ts                  # cn() helper para clsx + tailwind-merge
│   │   └── validations/
│   │       └── auth.schema.ts        # Schemas zod para formularios de auth
│   │
│   ├── hooks/
│   │   ├── use-auth.ts               # Hook de sesion del usuario
│   │   └── use-inactivity.ts         # HU-12.3 - timeout de sesion admin
│   │
│   ├── stores/
│   │   └── auth.store.ts             # Zustand store para estado de auth
│   │
│   └── middleware.ts                 # Proteccion de rutas por rol
│
├── next.config.js                    # Configuracion PWA + Next.js
└── tailwind.config.ts                # Tokens de diseno DuoCafe
```

### 4.2 NestJS API (`apps/api`)

```
apps/api/
├── src/
│   ├── main.ts                       # Bootstrap con Helmet, CORS, ValidationPipe
│   ├── app.module.ts                 # Modulo raiz
│   │
│   ├── config/
│   │   ├── config.module.ts
│   │   └── app.config.ts
│   │
│   ├── common/
│   │   ├── guards/
│   │   │   └── auth.guard.ts         # Valida JWT de Supabase (Sprint 1: solo para /health/ready)
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   │
│   ├── health/
│   │   ├── health.module.ts
│   │   └── health.controller.ts      # GET /health, GET /health/ready
│   │
│   └── redis/
│       ├── redis.module.ts
│       └── redis.service.ts
│
├── Dockerfile
└── nest-cli.json
```

### 4.3 Docker y Base de Datos

```
duocafe/
├── docker-compose.yml               # Todos los servicios
├── docker-compose.dev.yml           # Overrides desarrollo (hot reload, puertos expuestos)
│
├── docker/
│   └── supabase/
│       └── kong.yml                 # Configuracion de rutas Kong
│
├── database/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql   # Tablas basicas + user_profiles (Sprint 1)
│   │   ├── 002_rls_policies.sql     # Politicas RLS basicas
│   │   └── 003_triggers.sql         # handle_new_user trigger
│   │
│   └── seeds/
│       └── 001_admin_user.sql       # Usuario admin inicial + La Rosa brand
│
├── .env.example
├── .env                             # (git ignorado)
└── .gitignore
```

---

## 5. Archivos de Configuracion Clave

### 5.1 `.env` (plantilla)

```env
# DOMINIO
DOMAIN=localhost
ACME_EMAIL=admin@duocafe.co

# POSTGRESQL (Supabase self-hosted)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=super-secret-db-password
POSTGRES_DB=duocafe

# SUPABASE JWT (generar con: openssl rand -base64 32)
# Los JWTs de ANON y SERVICE_ROLE se generan con estos secrets
# Usa https://supabase.com/docs/guides/self-hosting#generate-api-keys
SUPABASE_JWT_SECRET=your-jwt-secret-min-32-chars
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# SUPABASE REALTIME
SUPABASE_REALTIME_ENC_KEY=your-realtime-enc-key
SUPABASE_REALTIME_SECRET_KEY_BASE=your-64-char-secret-key-base

# REDIS
REDIS_PASSWORD=redis-strong-password

# TRAEFIK DASHBOARD
TRAEFIK_DASHBOARD_AUTH=admin:$apr1$...  # htpasswd hash

# SMTP (para emails de verificacion/recuperacion)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@duocafe.co
SMTP_PASS=smtp-app-password
SMTP_ADMIN_EMAIL=noreply@duocafe.co

# GOOGLE OAUTH (opcional en Sprint 1)
GOOGLE_AUTH_ENABLED=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# APP
CORS_ORIGINS=http://localhost:3001,https://duocafe.co
LOG_LEVEL=info
NODE_ENV=development

# NEXT.JS (variables publicas — prefijo NEXT_PUBLIC_)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 5.2 `next.config.js` (con PWA)

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // no SW en dev
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-resources',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/_next\/image\?.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-image',
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
```

### 5.3 `public/manifest.json`

```json
{
  "name": "DuoCafe",
  "short_name": "DuoCafe",
  "description": "Aprende cafe. Gana cafe. Vive cafe.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1C1008",
  "theme_color": "#C8501A",
  "orientation": "portrait",
  "scope": "/",
  "lang": "es",
  "icons": [
    { "src": "/icons/icon-72x72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-96x96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icons/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144x144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152x152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-384x384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "shortcuts": [
    {
      "name": "Aprender",
      "short_name": "Aprender",
      "description": "Ir a mis lecciones",
      "url": "/home/learn",
      "icons": [{ "src": "/icons/icon-96x96.png", "sizes": "96x96" }]
    }
  ]
}
```

### 5.4 `tailwind.config.ts` (tokens DuoCafe)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal DuoCafe
        brand: {
          DEFAULT: '#C8501A',  // cafe tostado — color primario
          50: '#FDF5F0',
          100: '#FAEADE',
          200: '#F3C9A6',
          300: '#ECA86D',
          400: '#E58734',
          500: '#C8501A',      // primario
          600: '#A3401A',
          700: '#7D3019',
          800: '#582018',
          900: '#321008',
        },
        earth: {
          DEFAULT: '#3D2314',  // tierra/suelo
          light: '#6B3A25',
          dark: '#1C1008',     // fondo oscuro
        },
        cerezas: {
          DEFAULT: '#D42B2B',  // rojo cereza de cafe
          light: '#E85555',
          dark: '#A01E1E',
        },
        granos: {
          DEFAULT: '#F5A623',  // dorado/ambar para XP
          light: '#F7C56E',
          dark: '#C47E0A',
        },
        // Neutrales
        surface: {
          DEFAULT: '#FDFAF6',
          50: '#FFFFFF',
          100: '#FDFAF6',
          200: '#F5F0E8',
          300: '#E8DDD0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],   // titulos
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      animation: {
        'streak-flame': 'flame 1.5s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        flame: {
          '0%, 100%': { transform: 'scale(1) rotate(-3deg)' },
          '50%': { transform: 'scale(1.1) rotate(3deg)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### 5.5 `src/middleware.ts` (proteccion de rutas)

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { UserRole } from '@duocafe/shared';

// Rutas publicas (no requieren auth)
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/admin/login',
];

// Rutas por rol
const ROLE_ROUTES: Record<string, UserRole> = {
  '/admin': 'platform_admin',
  '/brand': 'brand_admin',
};

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Ruta publica: dejar pasar
  if (PUBLIC_ROUTES.some(route => path === route || path.startsWith(route + '/'))) {
    // Si ya tiene sesion y va a /login o /register, redirigir al home
    if (user && (path === '/login' || path === '/register')) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    return supabaseResponse;
  }

  // Sin sesion: redirigir al login correcto
  if (!user) {
    const loginUrl = path.startsWith('/admin') ? '/admin/login' : '/login';
    const redirectUrl = new URL(loginUrl, request.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  // Verificar rol para rutas protegidas por rol
  for (const [routePrefix, requiredRole] of Object.entries(ROLE_ROUTES)) {
    if (path.startsWith(routePrefix)) {
      const userRole = user.app_metadata?.role as UserRole;
      if (userRole !== requiredRole) {
        // Redirigir al home del rol que tiene
        const homeUrl = userRole === 'consumer' ? '/home' : '/login';
        return NextResponse.redirect(new URL(homeUrl, request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.png$).*)',
  ],
};
```

### 5.6 `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 5.7 `src/lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // En Server Components: ignorar (sin efecto en cookies desde SC)
          }
        },
      },
    }
  );
}
```

### 5.8 `src/lib/validations/auth.schema.ts`

```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  display_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  email: z
    .string()
    .email('Ingresa un email valido'),
  password: z
    .string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres')
    .regex(/[0-9]/, 'La contrasena debe tener al menos un numero'),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Las contrasenas no coinciden',
  path: ['confirm_password'],
});

export const loginSchema = z.object({
  email: z.string().email('Ingresa un email valido'),
  password: z.string().min(1, 'Ingresa tu contrasena'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Ingresa un email valido'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres')
    .regex(/[0-9]/, 'La contrasena debe tener al menos un numero'),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Las contrasenas no coinciden',
  path: ['confirm_password'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
```

---

## 6. Migraciones de Base de Datos (Sprint 1)

### `database/migrations/001_initial_schema.sql`

```sql
-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLA PRINCIPAL DE PERFILES DE USUARIO
-- ============================================

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,

    -- Gamificacion (valores iniciales, se poblaran en sprints posteriores)
    level INTEGER NOT NULL DEFAULT 1,
    level_title VARCHAR(50) NOT NULL DEFAULT 'Curioso',
    total_granos INTEGER NOT NULL DEFAULT 0,
    cerezas_balance INTEGER NOT NULL DEFAULT 0,
    cerezas_earned_total INTEGER NOT NULL DEFAULT 0,
    cerezas_spent_total INTEGER NOT NULL DEFAULT 0,

    -- Preferencias
    daily_goal VARCHAR(20) DEFAULT 'regular'
        CHECK (daily_goal IN ('casual', 'regular', 'intenso')),
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    initial_quiz_level INTEGER,

    -- Rol y acceso
    role VARCHAR(20) NOT NULL DEFAULT 'consumer'
        CHECK (role IN ('consumer', 'brand_admin', 'platform_admin', 'producer')),
    brand_id UUID,

    -- Referidos
    referral_code VARCHAR(12) UNIQUE NOT NULL,
    referred_by UUID,

    -- Notificaciones
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    streak_reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    fcm_token TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ,

    -- Version para bloqueo optimista
    version INTEGER NOT NULL DEFAULT 0
);

-- Indices
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_level ON public.user_profiles(level);
CREATE INDEX idx_user_profiles_referral_code ON public.user_profiles(referral_code);

-- ============================================
-- TABLA DE MARCAS (para crear La Rosa en seed)
-- ============================================

CREATE TABLE public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    whatsapp_number VARCHAR(20),
    instagram_url TEXT,
    website_url TEXT,
    email VARCHAR(255),
    is_founding_brand BOOLEAN NOT NULL DEFAULT FALSE,
    plan_tier VARCHAR(20) NOT NULL DEFAULT 'semilla'
        CHECK (plan_tier IN ('semilla', 'cosecha', 'origen_premium', 'fundador')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON public.brands(slug);
```

### `database/migrations/002_rls_policies.sql`

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: user_profiles
-- ============================================

-- Los usuarios pueden leer su propio perfil
CREATE POLICY "user_profiles_select_own"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

-- Lectura publica limitada (para mostrar nombre/avatar en ligas)
CREATE POLICY "user_profiles_select_public"
    ON public.user_profiles FOR SELECT
    USING (true);

-- Los usuarios pueden actualizar su propio perfil (solo campos no criticos)
CREATE POLICY "user_profiles_update_own"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Solo service_role puede insertar (via trigger)
-- (sin policy de INSERT para 'authenticated' — NestJS usa service_role key)

-- ============================================
-- POLICIES: brands
-- ============================================

-- Todos pueden leer marcas activas
CREATE POLICY "brands_select_active"
    ON public.brands FOR SELECT
    USING (is_active = true);

-- Platform admin puede gestionar todas las marcas
CREATE POLICY "brands_all_admin"
    ON public.brands FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'platform_admin'
        )
    );
```

### `database/migrations/003_triggers.sql`

```sql
-- ============================================
-- TRIGGER: crear user_profile al registrar usuario
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    display_name,
    referral_code,
    role,
    brand_id
  ) VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    -- Codigo de referido: 8 chars alfanumericos en mayusculas
    upper(
      substring(
        replace(encode(gen_random_bytes(6), 'base64'), '/', '0'), 1, 8
      )
    ),
    COALESCE(NEW.raw_app_meta_data->>'role', 'consumer'),
    (NEW.raw_app_meta_data->>'brand_id')::UUID
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCION: actualizar updated_at automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
```

### `database/seeds/001_admin_user.sql`

```sql
-- NOTA: Este seed se ejecuta despues de crear el usuario admin
-- via la CLI de Supabase o el dashboard de Studio.
-- El UUID se obtiene de auth.users despues de crear el usuario.

-- 1. Crear usuario admin via GoTrue primero:
--    email: admin@duocafe.co
--    password: (definir en el deploy)
--    role en app_metadata: platform_admin

-- 2. Insertar marca La Rosa:
INSERT INTO public.brands (
    id,
    name,
    slug,
    description,
    is_founding_brand,
    plan_tier,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',  -- UUID fijo para La Rosa
    'La Rosa',
    'la-rosa',
    'La primera marca de cafe de especialidad en DuoCafe. Pioneros del ecosistema cafetero gamificado de Colombia.',
    TRUE,
    'fundador',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

-- 3. Crear usuario admin de La Rosa (brand_admin):
--    email: admin@larosa.co
--    password: (definir en el deploy)
--    app_metadata: { "role": "brand_admin", "brand_id": "00000000-0000-0000-0000-000000000001" }
```

---

## 7. Health Check del API (NestJS)

### `apps/api/src/health/health.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}

  // Liveness — el proceso esta corriendo
  @Get()
  liveness() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'duocafe-api',
      version: process.env.npm_package_version,
    };
  }

  // Readiness — dependencias disponibles
  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      // Verificar conexion a Supabase/PostgREST
      () => this.http.pingCheck(
        'supabase',
        `${process.env.SUPABASE_URL}/rest/v1/`,
        { timeout: 3000 }
      ),
      // Verificar Redis
      () => this.redis.isHealthy('redis'),
    ]);
  }
}
```

---

## 8. Criterios de Exito del Sprint

Al finalizar Sprint 1, se debe poder demostrar:

### Checklist Tecnico

- [ ] `docker compose up` levanta todos los servicios sin errores
- [ ] `https://localhost` carga la app (Traefik con SSL auto)
- [ ] Supabase Studio accesible en `https://studio.localhost`
- [ ] `GET https://api.localhost/api/v1/health` retorna `200 OK`
- [ ] `GET https://api.localhost/api/v1/health/ready` retorna `200 OK` con DB + Redis OK

### Checklist HU-1.1 (Registro)
- [ ] Formulario de registro visible en `/register`
- [ ] Validaciones activas: nombre min 2 chars, email valido, password min 8 chars + numero
- [ ] Al registrar: email de verificacion llega al correo (GoTrue + SMTP)
- [ ] Al registrar: `user_profiles` se crea automaticamente con `referral_code` unico
- [ ] Error visible si email ya esta registrado
- [ ] Sin verificar email: no puede acceder a `/home`

### Checklist HU-1.2 (Login)
- [ ] Formulario de login en `/login`
- [ ] Login exitoso: redirige a `/home`
- [ ] Error generico si credenciales incorrectas (no especifica cual campo)
- [ ] Sesion persistente: recarga pagina y sigue autenticado
- [ ] Link "Olvide mi contrasena" visible y funcional

### Checklist HU-1.3 (Recuperacion de contrasena)
- [ ] `/forgot-password`: ingresa email, recibe correo con link
- [ ] Link del correo abre `/reset-password` con token valido
- [ ] Puede establecer nueva contrasena
- [ ] Sesiones anteriores invalidadas al cambiar contrasena

### Checklist HU-1.5 (Logout)
- [ ] Boton de logout en el menu/header accesible
- [ ] Al hacer logout: redirige a `/login`
- [ ] Despues del logout: intentar acceder a `/home` redirige a `/login`

### Checklist HU-12.3 (Login Admin)
- [ ] `/admin/login` es una pagina separada del login de consumidor
- [ ] Login con cuenta `platform_admin`: accede a `/admin/dashboard`
- [ ] Login con cuenta `brand_admin`: accede a `/brand/dashboard`
- [ ] Login con cuenta `consumer`: acceso denegado a `/admin/*`
- [ ] Inactividad de 30 min: logout automatico

### Checklist HU-13.1 (PWA)
- [ ] Chrome en Android muestra banner "Agregar a pantalla de inicio"
- [ ] App instalada abre sin barra del navegador (modo standalone)
- [ ] Icono visible en pantalla de inicio del dispositivo
- [ ] Lighthouse PWA score >= 80

### Checklist HU-13.2 (Responsive)
- [ ] Pantallas de auth se ven bien en 375px (iPhone SE)
- [ ] Pantallas de auth se ven bien en 768px (tablet)
- [ ] Pantallas de auth se ven bien en 1280px (desktop)
- [ ] Navegacion: bottom tab bar en movil (< 640px)
- [ ] Navegacion: sidebar en desktop (>= 1024px)

### Checklist HU-13.3 (Rendimiento)
- [ ] Lighthouse Performance >= 80 en pagina de login
- [ ] First Contentful Paint < 2 segundos (con throttling 4G en DevTools)
- [ ] Skeleton screens visibles durante carga de datos
- [ ] Imagenes usando `next/image` con lazy loading

---

## 9. Comandos Utiles Durante el Desarrollo

```bash
# Levantar todo el stack de desarrollo
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Logs de un servicio especifico
docker compose logs -f nestjs-api

# Ver estado de los contenedores
docker compose ps

# Acceder a PostgreSQL
docker exec -it duocafe-db psql -U postgres -d duocafe

# Ejecutar migraciones manualmente
docker exec -i duocafe-db psql -U postgres -d duocafe < database/migrations/001_initial_schema.sql
docker exec -i duocafe-db psql -U postgres -d duocafe < database/migrations/002_rls_policies.sql
docker exec -i duocafe-db psql -U postgres -d duocafe < database/migrations/003_triggers.sql

# Verificar Redis
docker exec -it duocafe-redis redis-cli -a ${REDIS_PASSWORD} ping

# Levantar solo Next.js en modo desarrollo (con hot reload)
cd apps/web && pnpm dev

# Levantar solo NestJS en modo desarrollo
cd apps/api && pnpm start:dev

# Builds de todos los paquetes (via Turborepo)
pnpm build

# Crear usuario admin inicial (via Supabase Studio)
# 1. Abrir https://studio.localhost
# 2. Authentication > Users > Invite User
# 3. Editar el usuario creado, agregar en app_metadata: {"role": "platform_admin"}

# Generar claves de Supabase (ANON_KEY y SERVICE_ROLE_KEY)
# Ir a https://supabase.com/docs/guides/self-hosting#generate-api-keys
# y usar el JWT_SECRET definido en .env
```

---

## 10. URLs Locales de Desarrollo

| Servicio | URL | Descripcion |
|---------|-----|-------------|
| App consumidor | http://localhost:3001 | Next.js dev server |
| API NestJS | http://localhost:3000/api/v1/health | Health check |
| Supabase Studio | http://localhost:54323 | Dashboard BD (en dev) |
| Supabase Auth | http://localhost:54321/auth/v1 | GoTrue API |
| Traefik Dashboard | http://localhost:8080 | Solo en produccion |
| Redis | localhost:6379 | Acceso directo en dev |

---

## 11. Notas de Implementacion

### Manejo de Sesion en Next.js App Router
Usar `@supabase/ssr` con el helper `createServerClient` para Server Components y Route Handlers. El `middleware.ts` renueva la sesion en cada request usando los cookies de Supabase. **No usar `createClient` del browser en Server Components.**

### Email de Verificacion en Desarrollo
En desarrollo con Supabase self-hosted, los emails van al servidor SMTP configurado. Para desarrollo local sin SMTP real, usar **Inbucket** (incluido en Supabase Docker setup) que atrapa todos los emails y los muestra en `http://localhost:54324`.

### Roles en Supabase JWT
Los roles se guardan en `app_metadata` del usuario (no en `user_metadata`). Solo el `service_role` key puede escribir en `app_metadata`. Para crear el primer admin: hacerlo directamente desde Supabase Studio > Authentication > Users > editar usuario > agregar `app_metadata`.

### Timeout de Sesion Admin (HU-12.3)
El timeout se implementa como un hook React en el layout de admin. Escucha eventos de mouse/teclado/touch. Despues de 30 minutos de inactividad, ejecuta `supabase.auth.signOut()` y redirige a `/admin/login`. Se resetea con cualquier interaccion del usuario.

### PWA en Desarrollo
`next-pwa` esta deshabilitado en `NODE_ENV=development` para evitar problemas de caching durante el desarrollo. Probar la PWA haciendo un build de produccion (`pnpm build && pnpm start`) o en el ambiente de staging.

---

*Sprint 1 — DuoCafe*
*Duracion: 2 semanas*
*Puntos del sprint: 19 SP (HU-13.1: 3 + HU-13.2: 5 + HU-13.3: 3 + HU-1.1: 3 + HU-1.2: 2 + HU-1.3: 2 + HU-1.5: 1 + HU-12.3: 3 = 22 SP estimados, 19 SP Must)*
