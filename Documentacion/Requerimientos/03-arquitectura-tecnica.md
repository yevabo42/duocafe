# DuoCafe - Arquitectura Tecnica

**Version:** 1.0
**Fecha:** 14 de febrero de 2026
**Proyecto:** DuoCafe — Plataforma de Gamificacion para el Ecosistema Cafetero Colombiano

---

## 1. Diagrama de Arquitectura del Sistema

```
                                 CLIENTES
    ┌──────────────────────┐    ┌──────────────────────┐
    │    Next.js PWA        │    │    Flutter App         │
    │    (Web Browser)      │    │    (iOS / Android)     │
    │                       │    │                        │
    │  - Consumer UI        │    │  - Consumer UI         │
    │  - Admin Panel        │    │  - Push via FCM        │
    │  - Brand Panel        │    │  - Offline lessons     │
    └─────────┬─────────────┘    └─────────┬──────────────┘
              │                            │
              │        HTTPS / WSS         │
              └────────────┬───────────────┘
                           │
                           ▼
    ┌────────────────────────────────────────────────────────┐
    │                TRAEFIK (Reverse Proxy)                  │
    │                                                        │
    │  - SSL/TLS automatico (Let's Encrypt)                  │
    │  - Auto-discovery de contenedores Docker via labels    │
    │  - Load balancing dinamico (round-robin / least-conn)  │
    │  - Rate limiting (middleware)                          │
    │  - Compresion gzip/brotli                             │
    │  - Security headers                                    │
    │  - Dashboard de monitoreo                              │
    │  - WebSocket proxy                                     │
    │  Puertos: 80/443 + 8080 (dashboard)                   │
    └──────────┬─────────────────────┬──────────────────────┘
               │                     │
               ▼                     ▼
    ┌───────────────────┐  ┌──────────────────────────────────┐
    │  SUPABASE          │  │  NestJS API (Docker)              │
    │  (Self-Hosted)     │  │  Puerto: 3000                     │
    │                    │  │                                   │
    │  Componentes:      │  │  Responsabilidades:               │
    │  ──────────────    │  │  ─────────────────                │
    │  - PostgreSQL 15   │  │  - Motor de Gamificacion          │
    │  - GoTrue (Auth)   │  │    (XP, niveles, rachas,          │
    │  - PostgREST       │  │     corazones, ligas, badges)     │
    │  - Realtime        │  │  - Logica de Negocio              │
    │  - Storage         │  │    (compras, recompensas,         │
    │  - Kong (Gateway)  │  │     retos, referidos)             │
    │  - Studio (Admin)  │  │  - Contenido educativo            │
    │  - PgBouncer       │  │  - Orquestador de notificaciones  │
    │  - Meta            │  │  - API Admin/Marca                │
    │                    │  │  - Validacion JWT                  │
    │  RLS Policies      │  │    (verifica JWTs de Supabase)    │
    └────────┬───────────┘  └───────┬──────────┬────────────────┘
             │                      │          │
             │    ┌─────────────────┘          │
             │    │                            │
             ▼    ▼                            ▼
    ┌──────────────────┐           ┌──────────────────────────┐
    │  PostgreSQL 15    │           │  Redis 7 (Self-Hosted)   │
    │  (via Supabase)   │           │  Puerto: 6379            │
    │                   │           │                          │
    │  - Todas las      │           │  - Cache de rachas       │
    │    tablas          │           │  - Leaderboards (ZSET)   │
    │  - RLS activo     │           │  - Timers corazones      │
    │  - PgBouncer      │           │  - Cache de sesion       │
    │    (conn pool)    │           │  - Rate limiting         │
    │  - WAL Archiving  │           │  - Reto diario cache     │
    │    (PITR backup)  │           │  - Colas BullMQ          │
    │  - Indices        │           │  - Contadores real-time  │
    │    optimizados    │           │  - AOF persistencia      │
    └──────────────────┘           └───────────┬──────────────┘
                                               │
                                               ▼
                                   ┌──────────────────────────┐
                                   │  BullMQ Worker (Docker)   │
                                   │                           │
                                   │  - Evaluacion de badges   │
                                   │  - Procesamiento de ligas │
                                   │  - Push notifications     │
                                   │  - Expiracion de rachas   │
                                   │  - Regeneracion corazones │
                                   │  - Agregacion analytics   │
                                   └──────────────────────────┘

                                   ┌──────────────────────────┐
                                   │  Scheduler (Docker)       │
                                   │  (siempre 1 replica)      │
                                   │                           │
                                   │  - Cron: rachas (01:00)   │
                                   │  - Cron: reto diario(00:00│
                                   │  - Cron: ligas (lunes)    │
                                   │  - Cron: codigos expirados│
                                   │  - Cron: metricas diarias │
                                   └──────────────────────────┘

    SERVICIOS EXTERNOS
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  Firebase     │  │  WhatsApp    │  │  SMTP         │
    │  Cloud        │  │  Business    │  │  (Email)      │
    │  Messaging    │  │  API (deep   │  │               │
    │  (Push)       │  │  links)      │  │  Transaccional│
    └──────────────┘  └──────────────┘  └──────────────┘
```

### Flujo de Datos

1. **Autenticacion:** Cliente conecta directamente a Supabase Auth (GoTrue) para login/signup/OAuth. Supabase retorna JWT.
2. **Peticiones API:** Cliente envia JWT en header `Authorization: Bearer` a NestJS API via Traefik. NestJS valida JWT usando el JWKS de Supabase.
3. **Lecturas publicas (fast path):** La PWA puede leer datos publicos directamente de Supabase via PostgREST con RLS (catalogo de productos, perfiles de productores). Esto reduce carga en NestJS.
4. **Escrituras de gamificacion:** Todas las mutaciones de XP, Cerezas, rachas, corazones, ligas y badges pasan por NestJS para garantizar integridad de reglas de negocio.
5. **Realtime:** Supabase Realtime para actualizaciones en vivo (contador de notificaciones, cambios de posicion en liga).
6. **Procesamiento asincrono:** NestJS encola jobs en BullMQ (respaldado por Redis). El Worker los procesa.

### Infraestructura: VPS 8 vCPU / 24GB RAM

---

## 2. Division de Responsabilidades

### 2.1 Supabase Self-Hosted

| Dominio | Detalle |
|---------|---------|
| **Autenticacion** | Registro email/password, Google OAuth, emision de JWT, refresh tokens, recuperacion de contrasena, verificacion de email |
| **Almacenamiento** | Imagenes de productos, fotos de productores, iconos de badges, avatares, media de lecciones. Buckets: `avatars/`, `products/`, `producers/`, `lessons/`, `badges/`, `brands/` |
| **Base de Datos** | PostgreSQL 15 con todas las tablas, migraciones, indices, triggers, foreign keys |
| **Row Level Security** | Control de acceso granular a nivel de fila (consumidores ven solo sus datos, marcas solo su marca, admins ven todo) |
| **Realtime** | WebSocket channels para: notificaciones, cambios de posicion en liga, actualizacion de corazones |
| **Lecturas directas** | Catalogo publico, perfiles de productores, catalogo de recompensas (read-only, protegido por RLS) — clientes consultan Supabase directamente para reducir carga en NestJS |

### 2.2 NestJS API

| Dominio | Detalle |
|---------|---------|
| **Motor de Gamificacion** | Calculo y asignacion de XP (Granos), evaluacion de subida de nivel, asignacion y gasto de Cerezas, bloqueo optimista en actualizaciones de balance |
| **Gestion de Rachas** | Incremento diario de racha, deteccion de racha rota (cron), activacion de escudo, recompensas por hitos |
| **Sistema de Corazones** | Deduccion por respuesta incorrecta, timer de regeneracion (Redis TTL), compra con Cerezas |
| **Procesamiento de Ligas** | Asignacion semanal, actualizacion de leaderboard, calculo de promocion/descenso (cron semanal), distribucion de recompensas |
| **Evaluacion de Badges** | Verificacion event-driven despues de acciones calificadas (leccion, compra, racha, visita a productor) |
| **Retos Diarios** | Asignacion a medianoche (cron), validacion de completado, distribucion de recompensas |
| **Flujo de Compras** | Generacion de codigos (panel marca), validacion y canje (consumidor), confirmacion (marca), acreditacion de recompensas |
| **Canje de Recompensas** | Verificacion de balance de Cerezas, deduccion atomica, generacion de cupon, gestion de expiracion |
| **Referidos** | Generacion de codigo, tracking, recompensas por conversion |
| **Notificaciones** | Decidir cuando/que enviar, encolar push notifications, gestionar preferencias |
| **Contenido Educativo** | Tracking de progreso en lecciones, validacion de ejercicios, deteccion de ruta completada, scoring de quizzes |
| **API Admin/Marca** | Agregacion de metricas para dashboard, gestion de usuarios, CRUD de contenido, gestion de codigos, gestion de recompensas |

### Principio de Decision

**Acceso directo a Supabase** = datos de solo lectura, publicamente seguros, protegidos por RLS.
**NestJS** = cualquier cosa que requiera validacion de logica de negocio, transacciones multi-paso, caching o procesamiento asincrono.

---

## 3. Esquema de Base de Datos (PostgreSQL 15 via Supabase)

### 3.1 Tablas de Usuarios

```sql
-- ============================================
-- PERFILES DE USUARIO
-- ============================================

-- auth.users de Supabase es la fuente de verdad para autenticacion.
-- Esta tabla extiende con datos especificos de la aplicacion.

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,

    -- Estado de gamificacion
    level INTEGER NOT NULL DEFAULT 1,
    level_title VARCHAR(50) NOT NULL DEFAULT 'Curioso',
    total_granos INTEGER NOT NULL DEFAULT 0,        -- XP (nunca decrece)
    cerezas_balance INTEGER NOT NULL DEFAULT 0,      -- moneda virtual (puede decrecer)
    cerezas_earned_total INTEGER NOT NULL DEFAULT 0,  -- total ganado historico
    cerezas_spent_total INTEGER NOT NULL DEFAULT 0,   -- total gastado historico

    -- Preferencias
    daily_goal VARCHAR(20) DEFAULT 'regular',  -- 'casual' | 'regular' | 'intenso'
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    initial_quiz_level INTEGER,

    -- Rol
    role VARCHAR(20) NOT NULL DEFAULT 'consumer'
        CHECK (role IN ('consumer', 'brand_admin', 'platform_admin', 'producer')),
    brand_id UUID,  -- solo para brand_admin

    -- Referidos
    referral_code VARCHAR(12) UNIQUE NOT NULL,
    referred_by UUID REFERENCES public.user_profiles(id),

    -- Notificaciones
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    streak_reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    fcm_token TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ,

    -- Bloqueo optimista para actualizaciones concurrentes de Cerezas/Granos
    version INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_level ON public.user_profiles(level);
CREATE INDEX idx_user_profiles_referral_code ON public.user_profiles(referral_code);
CREATE INDEX idx_user_profiles_brand_id ON public.user_profiles(brand_id) WHERE brand_id IS NOT NULL;
CREATE INDEX idx_user_profiles_total_granos ON public.user_profiles(total_granos DESC);
CREATE INDEX idx_user_profiles_last_active ON public.user_profiles(last_active_at);
```

```sql
-- ============================================
-- RACHAS (STREAKS)
-- ============================================

CREATE TABLE public.user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,

    -- Ultima fecha (zona horaria del usuario) con actividad registrada
    last_activity_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Escudo
    shield_active BOOLEAN NOT NULL DEFAULT FALSE,
    shield_activated_at TIMESTAMPTZ,
    shields_used_this_week INTEGER NOT NULL DEFAULT 0,
    week_start_date DATE,

    -- Hitos reclamados (evitar doble recompensa)
    milestone_7_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    milestone_30_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    milestone_60_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    milestone_100_claimed BOOLEAN NOT NULL DEFAULT FALSE,

    -- Racha de compra (mensual)
    purchase_streak_months INTEGER NOT NULL DEFAULT 0,
    last_purchase_month DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_streaks_user ON public.user_streaks(user_id);
CREATE INDEX idx_user_streaks_last_activity ON public.user_streaks(last_activity_date);
```

```sql
-- ============================================
-- CORAZONES (VIDAS)
-- ============================================

CREATE TABLE public.user_hearts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    hearts_remaining INTEGER NOT NULL DEFAULT 5
        CHECK (hearts_remaining >= 0 AND hearts_remaining <= 5),
    max_hearts INTEGER NOT NULL DEFAULT 5,

    -- Cuando corazones < max, indica cuando se regenera el siguiente
    -- NULL cuando corazones = max
    next_regen_at TIMESTAMPTZ,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_hearts_user ON public.user_hearts(user_id);
CREATE INDEX idx_user_hearts_regen ON public.user_hearts(next_regen_at)
    WHERE next_regen_at IS NOT NULL;
```

### 3.2 Tablas de Contenido Educativo

```sql
-- ============================================
-- RUTAS Y LECCIONES
-- ============================================

CREATE TABLE public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    route_type VARCHAR(20) NOT NULL DEFAULT 'universal'
        CHECK (route_type IN ('universal', 'brand', 'origin')),
    brand_id UUID,  -- NULL para rutas universales
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routes_type_order ON public.routes(route_type, sort_order);
CREATE INDEX idx_routes_brand ON public.routes(brand_id) WHERE brand_id IS NOT NULL;


CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Recompensas al completar
    granos_reward INTEGER NOT NULL DEFAULT 10,
    cerezas_reward INTEGER NOT NULL DEFAULT 5,

    -- Tiempo estimado en minutos
    estimated_minutes INTEGER NOT NULL DEFAULT 3,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_route_order ON public.lessons(route_id, sort_order);


CREATE TABLE public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,

    exercise_type VARCHAR(20) NOT NULL
        CHECK (exercise_type IN ('multiple_choice', 'true_false', 'matching', 'ordering')),

    -- Pregunta o enunciado
    question TEXT NOT NULL,
    image_url TEXT,

    -- Datos del ejercicio en JSON flexible
    -- multiple_choice: {"options": ["A","B","C","D"], "correct_index": 0}
    -- true_false: {"correct": true}
    -- matching: {"pairs": [{"left":"A","right":"1"}, ...]}
    -- ordering: {"items": ["C","A","D","B"], "correct_order": ["A","B","C","D"]}
    exercise_data JSONB NOT NULL,

    -- Explicacion mostrada despues de responder
    explanation TEXT,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercises_lesson_order ON public.exercises(lesson_id, sort_order);
```

```sql
-- ============================================
-- PROGRESO DEL USUARIO
-- ============================================

CREATE TABLE public.user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'not_started'
        CHECK (status IN ('not_started', 'in_progress', 'completed')),

    current_exercise_index INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    total_answers INTEGER NOT NULL DEFAULT 0,

    best_accuracy DECIMAL(5,2),

    completed_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_lesson_progress_user ON public.user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_status ON public.user_lesson_progress(user_id, status);


CREATE TABLE public.user_route_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,

    lessons_completed INTEGER NOT NULL DEFAULT 0,
    total_lessons INTEGER NOT NULL DEFAULT 0,

    quiz_passed BOOLEAN NOT NULL DEFAULT FALSE,
    quiz_score DECIMAL(5,2),
    quiz_last_attempt_at TIMESTAMPTZ,

    completed_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, route_id)
);

CREATE INDEX idx_user_route_progress_user ON public.user_route_progress(user_id);
```

### 3.3 Tablas de Comercio

```sql
-- ============================================
-- MARCAS
-- ============================================

CREATE TABLE public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,

    -- Contacto
    whatsapp_number VARCHAR(20),
    instagram_url TEXT,
    website_url TEXT,
    email VARCHAR(255),

    -- Configuracion
    is_founding_brand BOOLEAN NOT NULL DEFAULT FALSE,  -- La Rosa = true
    plan_tier VARCHAR(20) NOT NULL DEFAULT 'semilla'
        CHECK (plan_tier IN ('semilla', 'cosecha', 'origen_premium', 'fundador')),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON public.brands(slug);
CREATE INDEX idx_brands_active ON public.brands(is_active) WHERE is_active = TRUE;


-- ============================================
-- PRODUCTORES
-- ============================================

CREATE TABLE public.producers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    farm_name VARCHAR(200),
    slug VARCHAR(100) UNIQUE NOT NULL,
    bio TEXT,

    -- Ubicacion
    department VARCHAR(100),       -- Huila, Narino, Antioquia
    municipality VARCHAR(100),
    altitude_masl INTEGER,         -- metros sobre nivel del mar
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),

    -- Detalles de cafe
    varieties TEXT[],              -- {'Caturra', 'Castillo', 'Geisha'}
    processing_methods TEXT[],     -- {'Lavado', 'Natural', 'Honey'}

    -- Media
    profile_image_url TEXT,
    gallery_urls TEXT[],

    -- Metricas denormalizadas para lecturas rapidas
    follower_count INTEGER NOT NULL DEFAULT 0,
    profile_visit_count INTEGER NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_producers_slug ON public.producers(slug);
CREATE INDEX idx_producers_department ON public.producers(department);
CREATE INDEX idx_producers_active ON public.producers(is_active) WHERE is_active = TRUE;


-- ============================================
-- PRODUCTOS
-- ============================================

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    producer_id UUID REFERENCES public.producers(id) ON DELETE SET NULL,

    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,

    -- Precio
    price_cop DECIMAL(12, 2) NOT NULL,  -- pesos colombianos
    weight_grams INTEGER,
    presentation VARCHAR(50),  -- 'grano', 'molido', 'capsulas'

    -- Detalles de origen
    origin_region VARCHAR(100),
    origin_altitude INTEGER,
    variety VARCHAR(100),
    processing_method VARCHAR(50),
    roast_profile VARCHAR(50),     -- 'claro', 'medio', 'oscuro'

    -- Notas de cata
    sca_score DECIMAL(4,1),
    tasting_notes TEXT[],          -- {'Caramelo', 'Citricos', 'Floral'}
    acidity VARCHAR(20),
    body VARCHAR(20),

    -- Media
    image_urls TEXT[],

    -- Configuracion
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(brand_id, slug)
);

CREATE INDEX idx_products_brand ON public.products(brand_id);
CREATE INDEX idx_products_active ON public.products(is_active, brand_id) WHERE is_active = TRUE;
CREATE INDEX idx_products_producer ON public.products(producer_id) WHERE producer_id IS NOT NULL;
CREATE INDEX idx_products_price ON public.products(price_cop);


-- ============================================
-- CODIGOS DE COMPRA
-- ============================================

CREATE TABLE public.purchase_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(8) UNIQUE NOT NULL,
    brand_id UUID NOT NULL REFERENCES public.brands(id),
    product_id UUID REFERENCES public.products(id),

    status VARCHAR(20) NOT NULL DEFAULT 'generated'
        CHECK (status IN ('generated', 'delivered', 'redeemed', 'confirmed', 'expired')),

    -- Quien lo canjeo
    redeemed_by UUID REFERENCES public.user_profiles(id),
    redeemed_at TIMESTAMPTZ,

    -- Confirmacion de la marca
    confirmed_by UUID REFERENCES public.user_profiles(id),
    confirmed_at TIMESTAMPTZ,

    -- Recompensas
    granos_awarded INTEGER NOT NULL DEFAULT 30,
    cerezas_awarded INTEGER NOT NULL DEFAULT 20,
    rewards_credited BOOLEAN NOT NULL DEFAULT FALSE,

    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchase_codes_code ON public.purchase_codes(code);
CREATE INDEX idx_purchase_codes_brand ON public.purchase_codes(brand_id);
CREATE INDEX idx_purchase_codes_status ON public.purchase_codes(status);
CREATE INDEX idx_purchase_codes_redeemed_by ON public.purchase_codes(redeemed_by)
    WHERE redeemed_by IS NOT NULL;
CREATE INDEX idx_purchase_codes_expires ON public.purchase_codes(expires_at)
    WHERE status IN ('generated', 'delivered');
```

### 3.4 Tablas de Recompensas

```sql
-- ============================================
-- RECOMPENSAS Y CANJES
-- ============================================

CREATE TABLE public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,

    name VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    reward_type VARCHAR(30) NOT NULL DEFAULT 'discount'
        CHECK (reward_type IN ('discount', 'product', 'experience', 'content', 'shield')),

    cerezas_cost INTEGER NOT NULL CHECK (cerezas_cost > 0),

    -- Stock (NULL = ilimitado)
    stock_total INTEGER,
    stock_remaining INTEGER,

    -- Vigencia
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rewards_brand ON public.rewards(brand_id);
CREATE INDEX idx_rewards_active ON public.rewards(is_active, brand_id) WHERE is_active = TRUE;
CREATE INDEX idx_rewards_cost ON public.rewards(cerezas_cost);


CREATE TABLE public.redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    reward_id UUID NOT NULL REFERENCES public.rewards(id),
    brand_id UUID NOT NULL REFERENCES public.brands(id),

    cerezas_spent INTEGER NOT NULL,
    coupon_code VARCHAR(12) UNIQUE NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'used', 'expired', 'cancelled')),

    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_redemptions_user ON public.redemptions(user_id);
CREATE INDEX idx_redemptions_brand ON public.redemptions(brand_id);
CREATE INDEX idx_redemptions_status ON public.redemptions(status, expires_at);
CREATE INDEX idx_redemptions_coupon ON public.redemptions(coupon_code);
```

### 3.5 Tablas de Gamificacion

```sql
-- ============================================
-- BADGES (LOGROS)
-- ============================================

CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,

    badge_type VARCHAR(20) NOT NULL DEFAULT 'universal'
        CHECK (badge_type IN ('universal', 'brand', 'origin')),
    brand_id UUID REFERENCES public.brands(id),

    -- Definicion de condicion (evaluada por NestJS badge engine)
    -- {"type": "streak", "threshold": 7}
    -- {"type": "route_complete", "route_id": "uuid"}
    -- {"type": "purchases", "threshold": 1}
    -- {"type": "producer_visits", "threshold": 3}
    -- {"type": "registration"}
    condition JSONB NOT NULL,

    -- Recompensas al obtener el badge
    granos_reward INTEGER NOT NULL DEFAULT 0,
    cerezas_reward INTEGER NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_badges_type ON public.badges(badge_type);
CREATE INDEX idx_badges_active ON public.badges(is_active) WHERE is_active = TRUE;


CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);


-- ============================================
-- RETOS DIARIOS
-- ============================================

CREATE TABLE public.daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    challenge_type VARCHAR(20) NOT NULL
        CHECK (challenge_type IN ('trivia', 'lesson', 'exploration')),

    -- Para tipo trivia
    question TEXT,
    options JSONB,       -- {"options": ["A","B","C","D"], "correct_index": 0}
    explanation TEXT,

    -- Para tipo exploration
    target_type VARCHAR(20),  -- 'producer' | 'brand'
    target_id UUID,
    instruction TEXT,

    granos_reward INTEGER NOT NULL DEFAULT 15,
    cerezas_reward INTEGER NOT NULL DEFAULT 10,

    -- Programacion
    scheduled_date DATE,    -- NULL = en el pool de rotacion
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at DATE,      -- evitar repeticion en 30 dias

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_daily_challenges_scheduled ON public.daily_challenges(scheduled_date)
    WHERE scheduled_date IS NOT NULL;
CREATE INDEX idx_daily_challenges_pool ON public.daily_challenges(last_used_at)
    WHERE scheduled_date IS NULL AND is_active = TRUE;


CREATE TABLE public.user_daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id),
    challenge_date DATE NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'assigned'
        CHECK (status IN ('assigned', 'completed', 'expired')),

    completed_at TIMESTAMPTZ,
    answer_data JSONB,

    UNIQUE(user_id, challenge_date)
);

CREATE INDEX idx_user_daily_challenges_user_date ON public.user_daily_challenges(user_id, challenge_date DESC);
CREATE INDEX idx_user_daily_challenges_status ON public.user_daily_challenges(status, challenge_date);


-- ============================================
-- LIGAS
-- ============================================

CREATE TABLE public.leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificacion de semana
    week_start DATE NOT NULL,   -- Lunes de la semana
    week_end DATE NOT NULL,     -- Domingo de la semana

    league_tier INTEGER NOT NULL CHECK (league_tier BETWEEN 1 AND 6),
    -- 1=Semilla, 2=Grano Verde, 3=Pergamino, 4=Tostado, 5=Espresso, 6=Origen Dorado
    league_name VARCHAR(50) NOT NULL,

    group_number INTEGER NOT NULL,  -- multiples grupos por tier por semana

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'processing', 'completed')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(week_start, league_tier, group_number)
);

CREATE INDEX idx_leagues_week ON public.leagues(week_start, status);
CREATE INDEX idx_leagues_active ON public.leagues(status) WHERE status = 'active';


CREATE TABLE public.league_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,

    -- Puntos ganados esta semana
    weekly_granos INTEGER NOT NULL DEFAULT 0,

    -- Ranking final despues del procesamiento
    final_rank INTEGER,

    -- Resultado de promocion/descenso
    result VARCHAR(20)
        CHECK (result IN ('promoted', 'stayed', 'demoted')),

    reward_granos INTEGER DEFAULT 0,
    reward_cerezas INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, league_id)
);

CREATE INDEX idx_league_memberships_league ON public.league_memberships(league_id);
CREATE INDEX idx_league_memberships_user ON public.league_memberships(user_id);
CREATE INDEX idx_league_memberships_weekly_granos ON public.league_memberships(league_id, weekly_granos DESC);
```

### 3.6 Tablas de Soporte

```sql
-- ============================================
-- NOTIFICACIONES
-- ============================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    notification_type VARCHAR(30) NOT NULL
        CHECK (notification_type IN (
            'streak_reminder', 'streak_lost', 'streak_milestone',
            'level_up', 'badge_earned', 'purchase_confirmed',
            'daily_challenge', 'league_result', 'referral_bonus',
            'reward_expiring', 'general'
        )),

    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    action_url TEXT,        -- deep link
    data JSONB,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_push_sent BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, created_at DESC)
    WHERE is_read = FALSE;
CREATE INDEX idx_notifications_user_recent ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_push_pending ON public.notifications(is_push_sent, created_at)
    WHERE is_push_sent = FALSE;


-- ============================================
-- REFERIDOS
-- ============================================

CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.user_profiles(id),
    referred_id UUID NOT NULL UNIQUE REFERENCES public.user_profiles(id),

    status VARCHAR(20) NOT NULL DEFAULT 'registered'
        CHECK (status IN ('registered', 'first_purchase', 'rewarded')),

    referrer_cerezas_signup INTEGER NOT NULL DEFAULT 50,
    referred_cerezas_signup INTEGER NOT NULL DEFAULT 25,
    referrer_cerezas_purchase INTEGER DEFAULT 100,
    referred_cerezas_purchase INTEGER DEFAULT 100,

    signup_rewarded BOOLEAN NOT NULL DEFAULT FALSE,
    purchase_rewarded BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);


-- ============================================
-- LOG DE ACTIVIDAD (para rachas y analytics)
-- ============================================

CREATE TABLE public.user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    activity_type VARCHAR(30) NOT NULL
        CHECK (activity_type IN (
            'lesson_completed', 'quiz_completed', 'challenge_completed',
            'purchase_registered', 'producer_visited', 'reward_redeemed',
            'referral_sent', 'badge_earned', 'streak_shield_used'
        )),

    reference_type VARCHAR(30),  -- 'lesson', 'challenge', 'purchase_code'
    reference_id UUID,

    granos_earned INTEGER NOT NULL DEFAULT 0,
    cerezas_earned INTEGER NOT NULL DEFAULT 0,

    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Candidata a particionamiento por mes (tabla de alto volumen)
CREATE INDEX idx_user_activities_user_date ON public.user_activities(user_id, activity_date DESC);
CREATE INDEX idx_user_activities_type ON public.user_activities(activity_type, activity_date DESC);
CREATE INDEX idx_user_activities_date ON public.user_activities(activity_date);


-- ============================================
-- SEGUIMIENTO DE PRODUCTORES
-- ============================================

CREATE TABLE public.producer_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    producer_id UUID NOT NULL REFERENCES public.producers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, producer_id)
);

CREATE INDEX idx_producer_follows_user ON public.producer_follows(user_id);
CREATE INDEX idx_producer_follows_producer ON public.producer_follows(producer_id);


-- ============================================
-- VISITAS A PRODUCTORES (para badges)
-- ============================================

CREATE TABLE public.producer_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    producer_id UUID NOT NULL REFERENCES public.producers(id) ON DELETE CASCADE,
    visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, producer_id)
);

CREATE INDEX idx_producer_visits_user ON public.producer_visits(user_id);
```

### 3.7 Estrategia de Indexacion y Particionamiento

**Indices de alta concurrencia** ya definidos arriba. Principios clave:

1. **Indices compuestos** en pares frecuentemente consultados: `(user_id, status)`, `(user_id, activity_date)`, `(brand_id, is_active)`
2. **Indices parciales** con WHERE para mantener indices pequenos: `WHERE is_active = TRUE`, `WHERE is_read = FALSE`
3. **Indices descendentes** en columnas de ranking: `total_granos DESC`, `weekly_granos DESC`
4. **Candidatas a particionamiento** (por rango mensual de fecha):
   - `user_activities` — particion por `activity_date`. Crece rapido y las queries siempre filtran por rango de fecha
   - `notifications` — particion por `created_at`. Notificaciones viejas se consultan poco
5. **Sin particionamiento necesario** para: `user_profiles` (tamano moderado), `products` (pequena), `exercises` (pequena), `league_memberships` (se reinician semanalmente)

---

## 4. Estructuras de Datos Redis

Todas las keys usan el prefijo `duocafe:` para evitar colisiones.

### 4.1 Rachas Activas

```
Key:    duocafe:streak:{user_id}
Tipo:   HASH
Campos:
  current_streak    -> integer
  last_activity     -> fecha ISO (ej: "2026-02-14")
  shield_active     -> "0" o "1"

TTL:    Ninguno (persistente; limpieza por cron si inactivo > 60 dias)

Proposito: Lectura rapida al abrir la app (home muestra racha).
           NestJS consulta Redis antes de PostgreSQL.
           Se escribe en cada actividad calificada.
           PostgreSQL es fuente de verdad; Redis es cache + fast path.
```

### 4.2 Leaderboards de Ligas

```
Key:    duocafe:league:{league_id}:leaderboard
Tipo:   SORTED SET
Members: user_id
Score:   weekly_granos (integer)

TTL:    Expira 48 horas despues del week_end de la liga

Comandos:
  ZINCRBY duocafe:league:{league_id}:leaderboard {granos} {user_id}
  ZREVRANGE duocafe:league:{league_id}:leaderboard 0 29 WITHSCORES  -- top 30
  ZREVRANK duocafe:league:{league_id}:leaderboard {user_id}          -- posicion del usuario

Proposito: Leaderboard en tiempo real sin consultar PostgreSQL.
           Cron semanal persiste scores finales en league_memberships.
```

### 4.3 Regeneracion de Corazones

```
Enfoque: BullMQ delayed jobs (mas confiable que TTL de Redis)

Cuando corazones < 5:
  - Se encola un job en la cola 'heart-regeneration'
  - Delay: 1800 segundos (30 minutos)
  - Payload: { user_id, current_hearts }
  - Al ejecutarse: incrementa corazones en 1 (DB + Redis)
  - Si aun < 5, encola otro job

Cache auxiliar:
Key:    duocafe:hearts:{user_id}
Tipo:   HASH
Campos:
  remaining         -> integer (0-5)
  next_regen_at     -> Unix timestamp (ms) o "null"

TTL:    24 horas de inactividad (se reconstruye desde PostgreSQL)
```

### 4.4 Cache de Sesion

```
Key:    duocafe:session:{user_id}
Tipo:   HASH
Campos:
  role              -> "consumer" | "brand_admin" | "platform_admin"
  brand_id          -> UUID o "null"
  level             -> integer
  display_name      -> string
  cerezas_balance   -> integer

TTL:    3600 segundos (1 hora), renovado en cada llamada API

Proposito: Evitar consultar user_profiles en cada request autenticado.
           Se invalida al actualizar el perfil.
```

### 4.5 Rate Limiting

```
Key:    duocafe:ratelimit:{user_id}:{endpoint_group}
Tipo:   STRING (contador)
TTL:    Ventana (ej: 60 segundos)

Patron: Token bucket via Redis + script Lua
  - API general: 100 requests / 60 seg por usuario
  - Auth endpoints: 10 requests / 60 seg por IP
  - Canje de codigo: 5 requests / 60 seg por usuario
  - Canje de recompensa: 3 requests / 60 seg por usuario

Key:    duocafe:ratelimit:ip:{ip_address}
Tipo:   STRING (contador)
TTL:    60 segundos
```

### 4.6 Cache de Reto Diario

```
Key:    duocafe:daily_challenge:{date_string}
Tipo:   HASH
Campos:
  challenge_id      -> UUID
  challenge_type    -> "trivia" | "lesson" | "exploration"
  question          -> string (para trivia)
  options           -> JSON string (para trivia)
  instruction       -> string (para exploration)
  granos_reward     -> integer
  cerezas_reward    -> integer

TTL:    86400 segundos (24 horas, configurado a medianoche)

Key:    duocafe:daily_challenge:user:{user_id}:{date_string}
Tipo:   STRING
Valor:  "assigned" | "completed"
TTL:    86400 segundos

Proposito: Evitar consultar tablas de retos en cada carga del home.
```

### 4.7 Contadores en Tiempo Real

```
Key:    duocafe:counters:dau:{date_string}
Tipo:   HYPERLOGLOG
Comando: PFADD duocafe:counters:dau:{date_string} {user_id}
TTL:    7 dias

Key:    duocafe:counters:lessons_today:{date_string}
Tipo:   STRING (contador atomico via INCR)
TTL:    48 horas

Key:    duocafe:counters:purchases_today:{date_string}
Tipo:   STRING (contador atomico via INCR)
TTL:    48 horas

Key:    duocafe:counters:unread_notifications:{user_id}
Tipo:   STRING (integer)
TTL:    Ninguno (se decrementa al leer, se incrementa al crear)

Proposito: Metricas rapidas para dashboard sin COUNT en tablas grandes.
           HyperLogLog para DAU da ~0.81% de error, aceptable para dashboards.
```

### 4.8 Liga Activa del Usuario

```
Key:    duocafe:user_league:{user_id}
Tipo:   HASH
Campos:
  league_id         -> UUID
  league_tier       -> integer
  league_name       -> string
  weekly_granos     -> integer
  rank              -> integer

TTL:    3600 segundos (renovado en cada actividad)

Proposito: Acceso rapido a "tu posicion en la liga" del home screen.
```

---

## 5. Arquitectura API NestJS

### 5.1 Estructura de Modulos

```
src/
├── main.ts
├── app.module.ts
│
├── common/                         # Utilidades compartidas
│   ├── guards/
│   │   ├── auth.guard.ts           # Valida JWT de Supabase
│   │   ├── roles.guard.ts          # Control de acceso por rol
│   │   └── throttle.guard.ts       # Rate limiting guard
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── public.decorator.ts     # Marca endpoint como sin auth
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   ├── transform.interceptor.ts  # Envolvente de respuesta estandar
│   │   └── timeout.interceptor.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── pipes/
│   │   └── validation.pipe.ts      # Integracion class-validator
│   ├── dto/
│   │   └── pagination.dto.ts
│   └── interfaces/
│       ├── jwt-payload.interface.ts
│       └── paginated-result.interface.ts
│
├── config/                         # Modulo de configuracion
│   ├── config.module.ts
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── supabase.config.ts
│   └── app.config.ts
│
├── database/                       # Modulo de base de datos
│   ├── database.module.ts
│   └── entities/                   # Definiciones de entidades
│       ├── user-profile.entity.ts
│       ├── user-streak.entity.ts
│       ├── user-hearts.entity.ts
│       ├── route.entity.ts
│       ├── lesson.entity.ts
│       ├── exercise.entity.ts
│       └── index.ts
│
├── redis/
│   ├── redis.module.ts
│   └── redis.service.ts
│
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts             # Verificacion JWT via Supabase JWKS
│   └── strategies/
│       └── supabase-jwt.strategy.ts
│
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
│
├── gamification/                   # Motor de gamificacion (core)
│   ├── gamification.module.ts
│   ├── xp/
│   │   ├── xp.service.ts           # Asignar XP, calcular subida de nivel
│   │   └── xp.constants.ts         # Umbrales de nivel, XP por accion
│   ├── cerezas/
│   │   ├── cerezas.service.ts      # Asignar/gastar Cerezas con bloqueo optimista
│   │   └── cerezas.constants.ts
│   ├── streaks/
│   │   ├── streaks.controller.ts
│   │   ├── streaks.service.ts
│   │   └── streaks.cron.ts         # Cron diario: expirar rachas rotas
│   ├── hearts/
│   │   ├── hearts.controller.ts
│   │   ├── hearts.service.ts
│   │   └── dto/
│   ├── badges/
│   │   ├── badges.controller.ts
│   │   ├── badges.service.ts       # Motor de evaluacion de badges
│   │   └── badge-evaluator/        # Patron Strategy por condicion
│   │       ├── streak-evaluator.ts
│   │       ├── route-evaluator.ts
│   │       ├── purchase-evaluator.ts
│   │       └── visit-evaluator.ts
│   └── levels/
│       └── levels.service.ts       # Umbrales, asignacion de titulo
│
├── leagues/
│   ├── leagues.module.ts
│   ├── leagues.controller.ts
│   ├── leagues.service.ts          # Consultas de leaderboard (Redis)
│   ├── leagues.cron.ts             # Semanal: crear ligas, procesar resultados
│   └── dto/
│
├── lessons/
│   ├── lessons.module.ts
│   ├── lessons.controller.ts
│   ├── lessons.service.ts          # Flujo de leccion, validacion de ejercicios
│   ├── exercises.service.ts        # Validar respuestas por tipo
│   └── dto/
│
├── challenges/
│   ├── challenges.module.ts
│   ├── challenges.controller.ts
│   ├── challenges.service.ts
│   ├── challenges.cron.ts          # Diario: asignar retos
│   └── dto/
│
├── products/
│   ├── products.module.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── dto/
│
├── purchases/
│   ├── purchases.module.ts
│   ├── purchases.controller.ts
│   ├── purchases.service.ts
│   └── dto/
│
├── rewards/
│   ├── rewards.module.ts
│   ├── rewards.controller.ts
│   ├── rewards.service.ts
│   └── dto/
│
├── producers/
│   ├── producers.module.ts
│   ├── producers.controller.ts
│   ├── producers.service.ts
│   └── dto/
│
├── notifications/
│   ├── notifications.module.ts
│   ├── notifications.controller.ts
│   ├── notifications.service.ts
│   ├── push.service.ts             # Integracion Firebase Cloud Messaging
│   └── dto/
│
├── referrals/
│   ├── referrals.module.ts
│   ├── referrals.controller.ts
│   ├── referrals.service.ts
│   └── dto/
│
├── admin/                          # API Panel Admin
│   ├── admin.module.ts
│   ├── dashboard/
│   │   ├── dashboard.controller.ts
│   │   └── dashboard.service.ts    # Agregacion de metricas
│   ├── users/
│   │   ├── admin-users.controller.ts
│   │   └── admin-users.service.ts
│   ├── content/
│   │   ├── admin-content.controller.ts
│   │   └── admin-content.service.ts
│   ├── challenges/
│   │   ├── admin-challenges.controller.ts
│   │   └── admin-challenges.service.ts
│   └── badges/
│       ├── admin-badges.controller.ts
│       └── admin-badges.service.ts
│
├── brand/                          # API Panel Marca
│   ├── brand.module.ts
│   ├── brand-dashboard/
│   │   ├── brand-dashboard.controller.ts
│   │   └── brand-dashboard.service.ts
│   ├── brand-products/
│   │   ├── brand-products.controller.ts
│   │   └── brand-products.service.ts
│   ├── brand-codes/
│   │   ├── brand-codes.controller.ts
│   │   └── brand-codes.service.ts
│   └── brand-rewards/
│       ├── brand-rewards.controller.ts
│       └── brand-rewards.service.ts
│
├── queues/                         # Definiciones de jobs BullMQ
│   ├── queues.module.ts
│   ├── processors/
│   │   ├── league.processor.ts
│   │   ├── badge.processor.ts
│   │   ├── notification.processor.ts
│   │   ├── streak.processor.ts
│   │   └── heart-regen.processor.ts
│   └── producers/
│       ├── league.producer.ts
│       ├── badge.producer.ts
│       └── notification.producer.ts
│
└── health/
    ├── health.module.ts
    └── health.controller.ts
```

### 5.2 Endpoints API

```
BASE URL: /api/v1

# AUTH
POST   /auth/validate-token           # Validar JWT de Supabase, retornar info sesion

# PERFIL DE USUARIO
GET    /users/me                       # Perfil completo con stats de gamificacion
PUT    /users/me                       # Actualizar perfil (nombre, avatar, meta diaria)
GET    /users/:id/profile              # Perfil publico (para vistas de liga)

# GAMIFICACION - RACHAS
GET    /streaks/me                     # Info de racha actual
POST   /streaks/shield                 # Activar escudo (cuesta Cerezas)

# GAMIFICACION - CORAZONES
GET    /hearts/me                      # Corazones restantes + tiempo regeneracion
POST   /hearts/refill                  # Comprar 1 corazon con Cerezas

# GAMIFICACION - BADGES
GET    /badges                         # Todos los badges (obtenidos + siluetas)
GET    /badges/me                      # Solo badges obtenidos

# LIGAS
GET    /leagues/me                     # Liga actual, posicion, granos semanales
GET    /leagues/:id/leaderboard        # Tabla de posiciones de un grupo

# CONTENIDO EDUCATIVO
GET    /routes                         # Todas las rutas con progreso
GET    /routes/:id                     # Detalle de ruta con lista de lecciones
GET    /lessons/:id                    # Detalle de leccion con ejercicios
POST   /lessons/:id/start             # Iniciar intento de leccion
POST   /lessons/:id/answer            # Enviar respuesta al ejercicio actual
POST   /lessons/:id/complete          # Marcar leccion como completada
POST   /routes/:id/quiz/start         # Iniciar quiz de ruta
POST   /routes/:id/quiz/submit        # Enviar respuestas de quiz

# RETOS DIARIOS
GET    /challenges/today               # Reto de hoy
POST   /challenges/:id/complete        # Completar reto del dia

# PRODUCTOS
GET    /products                       # Catalogo (filtrable, paginado)
GET    /products/:id                   # Detalle con info de origen

# COMPRAS
POST   /purchases/redeem               # Canjear codigo de compra
GET    /purchases/me                   # Historial de compras

# RECOMPENSAS
GET    /rewards                        # Catalogo de recompensas disponibles
POST   /rewards/:id/redeem             # Canjear Cerezas por recompensa
GET    /rewards/me/redemptions         # Historial de canjes

# PRODUCTORES
GET    /producers                      # Lista (filtrable por region)
GET    /producers/:slug                # Perfil detallado
POST   /producers/:id/follow           # Seguir productor
POST   /producers/:id/visit            # Registrar visita (para badges)

# NOTIFICACIONES
GET    /notifications                  # Notificaciones del usuario (paginadas)
PATCH  /notifications/:id/read         # Marcar como leida
PATCH  /notifications/read-all         # Marcar todas como leidas
PUT    /notifications/preferences      # Actualizar preferencias

# REFERIDOS
GET    /referrals/me                   # Stats de referidos + codigo
POST   /referrals/apply                # Aplicar codigo de referido

# ADMIN (requiere rol platform_admin)
GET    /admin/dashboard                # Metricas de plataforma
GET    /admin/users                    # Lista de usuarios con busqueda/filtro
GET    /admin/users/:id                # Detalle de usuario (vista admin)
PUT    /admin/users/:id                # Modificar usuario
POST   /admin/routes                   # Crear ruta
PUT    /admin/routes/:id               # Actualizar ruta
POST   /admin/lessons                  # Crear leccion
PUT    /admin/lessons/:id              # Actualizar leccion
POST   /admin/exercises                # Crear ejercicio
PUT    /admin/exercises/:id            # Actualizar ejercicio
POST   /admin/challenges               # Crear reto diario
PUT    /admin/challenges/:id           # Actualizar reto
POST   /admin/badges                   # Crear badge
PUT    /admin/badges/:id               # Actualizar badge
POST   /admin/producers                # Crear perfil de productor
PUT    /admin/producers/:id            # Actualizar productor

# PANEL MARCA (requiere rol brand_admin)
GET    /brand/dashboard                # Metricas de la marca
GET    /brand/products                 # Productos de la marca
POST   /brand/products                 # Crear producto
PUT    /brand/products/:id             # Actualizar producto
POST   /brand/codes/generate           # Generar codigos (individual o lote)
GET    /brand/codes                    # Listar codigos con filtro de estado
POST   /brand/codes/:id/confirm        # Confirmar compra
GET    /brand/rewards                  # Recompensas de la marca
POST   /brand/rewards                  # Crear recompensa
PUT    /brand/rewards/:id              # Actualizar recompensa
GET    /brand/redemptions              # Ver canjes de la marca

# HEALTH
GET    /health                         # Liveness check
GET    /health/ready                   # Readiness check (DB + Redis)
```

### 5.3 Flujo de Autenticacion

```
     Request con Authorization: Bearer <supabase_jwt>
                          │
                          ▼
               ┌─────────────────────┐
               │     AuthGuard       │
               │   (guard global)    │
               └──────────┬──────────┘
                          │
              ┌───────────┼───────────┐
              │                       │
        @Public()?              Tiene Bearer token?
              │                       │
        SI: pasar               NO: 401 Unauthorized
        directo                       │
                                SI: verificar
                                      │
                                      ▼
                       ┌──────────────────────────┐
                       │  Supabase JWT Strategy    │
                       │                           │
                       │  1. Decodificar header    │
                       │  2. Obtener JWKS de       │
                       │     Supabase (cacheado    │
                       │     en memoria 1hr)       │
                       │  3. Verificar firma       │
                       │  4. Validar exp, iss, aud │
                       │  5. Extraer sub (user_id) │
                       │     y rol de los claims   │
                       └────────────┬──────────────┘
                                    │
                                    ▼
                       ┌──────────────────────────┐
                       │  Cache de Sesion (Redis)  │
                       │                           │
                       │  Check duocafe:session:   │
                       │  {user_id}                │
                       │                           │
                       │  HIT: adjuntar a request  │
                       │  MISS: consultar DB,      │
                       │        cachear en Redis,  │
                       │        adjuntar a request │
                       └────────────┬──────────────┘
                                    │
                                    ▼
                       ┌──────────────────────────┐
                       │     RolesGuard            │
                       │                           │
                       │  Verificar @Roles()       │
                       │  contra user.role         │
                       │                           │
                       │  brand_admin: validar     │
                       │  que brand_id coincida    │
                       │  con recurso solicitado   │
                       └────────────┬──────────────┘
                                    │
                                    ▼
                             Controller handler
```

### 5.4 Estrategia de Rate Limiting

| Grupo de Endpoints | Limite | Ventana | Key |
|---------------------|--------|---------|-----|
| API general (autenticado) | 100 req | 60 seg | `user_id` |
| API general (no autenticado) | 30 req | 60 seg | `IP` |
| Auth endpoints | 10 req | 60 seg | `IP` |
| Canje de codigo de compra | 5 req | 60 seg | `user_id` |
| Canje de recompensa | 3 req | 60 seg | `user_id` |
| Envio de respuestas | 30 req | 60 seg | `user_id` |
| Admin endpoints | 200 req | 60 seg | `user_id` |

Implementacion: `ThrottleGuard` custom con Redis INCR + EXPIRE (sliding window counter). Retorna `429 Too Many Requests` con header `Retry-After`.

### 5.5 Sistema de Colas (BullMQ)

| Cola | Tipos de Job | Concurrencia | Notas |
|------|-------------|--------------|-------|
| `badge-evaluation` | `evaluate-badges` | 5 | Disparado tras completar leccion, compra, hito de racha, visita a productor |
| `league-processing` | `create-weekly-leagues`, `process-league-results` | 1 | Semanal. Serial para evitar race conditions |
| `notifications` | `send-push`, `send-streak-reminder`, `send-batch-push` | 10 | Alto throughput. Batch de rachas a las 20:00 |
| `streak-processing` | `expire-broken-streaks` | 1 | Diario a las 01:00 UTC. Marca rachas rotas en batch |
| `heart-regeneration` | `regenerate-heart` | 5 | Jobs delayed: cada regeneracion es un job con delay de 30 min |
| `analytics` | `aggregate-daily-stats` | 1 | Diario: agregacion de DAU, lecciones, compras |

---

## 6. Patrones de Alta Concurrencia

### 6.1 Connection Pooling

- **PgBouncer** (self-hosted junto a Supabase) en modo transaccion, puerto 6543
- **Pool de conexiones NestJS:** TypeORM/Prisma pool size: 10-20 conexiones por instancia
- **Redis:** `ioredis` con `maxRetriesPerRequest: 3`, pool de 10 conexiones

### 6.2 Estrategia de Caching

**Cache-Aside (Lazy Loading)** para la mayoria de lecturas:
```
1. Consultar cache en Redis
2. Si HIT: retornar datos cacheados
3. Si MISS: consultar PostgreSQL, escribir en Redis con TTL, retornar datos
```
Aplicado a: perfiles de usuario, catalogo de productos, perfiles de productores, metadata de rutas/lecciones, definiciones de badges.

**Write-Through** para estado de gamificacion:
```
1. Escribir en PostgreSQL (fuente de verdad)
2. Actualizar cache en Redis en la misma operacion
```
Aplicado a: actualizaciones de racha, cambios de corazones, balance de XP/Cerezas, incremento de score en liga.

**Invalidacion de cache:**
- **Basada en TTL:** la mayoria de caches expiran en 1-24 horas
- **Invalidacion explicita:** cuando admin actualiza contenido (lecciones, productos, badges), se limpian keys Redis relevantes
- **Basada en version:** `user_profiles.version` se incrementa en cada cambio de balance; cache incluye version

### 6.3 Bloqueo Optimista para Actualizaciones Concurrentes

Para actualizaciones de XP (Granos) y Cerezas:

```sql
-- Ejemplo de gasto de Cerezas con bloqueo optimista:
UPDATE user_profiles
SET cerezas_balance = cerezas_balance - @cost,
    cerezas_spent_total = cerezas_spent_total + @cost,
    version = version + 1,
    updated_at = NOW()
WHERE id = @user_id
  AND cerezas_balance >= @cost
  AND version = @expected_version
RETURNING version;

-- Si 0 filas afectadas: balance insuficiente o conflicto de version -> reintentar
```

NestJS implementa logica de reintentos (max 3 con backoff exponencial).

### 6.4 Procesamiento Basado en Colas

Todas las operaciones que no estan en la ruta critica son asincronas:
- **Evaluacion de badges:** despues de completar leccion, la respuesta retorna inmediatamente con XP/Cerezas. Un job de BullMQ evalua badges en segundo plano
- **Actualizacion de scores en liga:** `ZINCRBY` en Redis es atomico y rapido. La escritura a PostgreSQL se encola
- **Push notifications:** siempre asincronas via la cola de notificaciones

### 6.5 Escalado Horizontal

```
                     TRAEFIK (Load Balancer)
                     /        |        \
             NestJS-1    NestJS-2    NestJS-3
                \           |           /
                 \          |          /
               PostgreSQL (via PgBouncer)
                           +
                        Redis
                           +
                BullMQ Worker-1, Worker-2
```

- **NestJS es stateless** (todo el estado en PostgreSQL + Redis). Escala horizontalmente con multiples contenedores Docker tras Traefik
- **Traefik detecta automaticamente** nuevas replicas via Docker labels
- **Redis single-instance** para MVP. Futuro: Redis Sentinel o Redis Cluster
- **BullMQ workers** escalan independientemente. Multiples workers procesan la misma cola

---

## 7. Docker Compose

### 7.1 Servicios de la Aplicacion

```yaml
# docker-compose.yml

version: "3.8"

services:
  # ─────────────────────────────────────────────
  # TRAEFIK - Reverse Proxy & Load Balancer
  # ─────────────────────────────────────────────
  traefik:
    image: traefik:v3.0
    container_name: duocafe-traefik
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
      - "--accesslog=true"
      - "--accesslog.filepath=/logs/access.log"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"    # Dashboard (proteger en produccion)
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik-letsencrypt:/letsencrypt
      - traefik-logs:/logs
    restart: unless-stopped
    networks:
      - duocafe-network
    labels:
      - "traefik.enable=true"
      # Dashboard (protegido con autenticacion basica)
      - "traefik.http.routers.dashboard.rule=Host(`traefik.${DOMAIN}`)"
      - "traefik.http.routers.dashboard.service=api@internal"
      - "traefik.http.routers.dashboard.middlewares=auth-dashboard"
      - "traefik.http.middlewares.auth-dashboard.basicauth.users=${TRAEFIK_DASHBOARD_AUTH}"

      # Middleware global: rate limiting
      - "traefik.http.middlewares.rate-limit.ratelimit.average=100"
      - "traefik.http.middlewares.rate-limit.ratelimit.burst=50"
      - "traefik.http.middlewares.rate-limit.ratelimit.period=1m"

      # Middleware global: security headers
      - "traefik.http.middlewares.security-headers.headers.stsSeconds=31536000"
      - "traefik.http.middlewares.security-headers.headers.stsIncludeSubdomains=true"
      - "traefik.http.middlewares.security-headers.headers.frameDeny=true"
      - "traefik.http.middlewares.security-headers.headers.contentTypeNosniff=true"
      - "traefik.http.middlewares.security-headers.headers.browserXssFilter=true"

      # Middleware global: compresion
      - "traefik.http.middlewares.compress.compress=true"

  # ─────────────────────────────────────────────
  # NestJS API - Servidor de Aplicacion
  # ─────────────────────────────────────────────
  nestjs-api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
      target: production
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@pgbouncer:6543/${POSTGRES_DB}
      - SUPABASE_URL=http://supabase-kong:8000
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - SUPABASE_JWT_SECRET=${SUPABASE_JWT_SECRET}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - FCM_SERVICE_ACCOUNT=${FCM_SERVICE_ACCOUNT}
      - CORS_ORIGINS=${CORS_ORIGINS}
      - LOG_LEVEL=${LOG_LEVEL:-info}
    depends_on:
      redis:
        condition: service_healthy
      supabase-db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - duocafe-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.${DOMAIN}`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
      - "traefik.http.routers.api.middlewares=rate-limit,security-headers,compress"
      - "traefik.http.services.api.loadbalancer.server.port=3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/v1/health"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 30s
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1024M
          cpus: "1.0"
        reservations:
          memory: 512M
          cpus: "0.5"

  # ─────────────────────────────────────────────
  # BullMQ Worker - Procesamiento Asincrono
  # ─────────────────────────────────────────────
  worker:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
      target: production
    container_name: duocafe-worker
    command: ["node", "dist/worker.js"]
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@pgbouncer:6543/${POSTGRES_DB}
      - SUPABASE_URL=http://supabase-kong:8000
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - FCM_SERVICE_ACCOUNT=${FCM_SERVICE_ACCOUNT}
      - LOG_LEVEL=${LOG_LEVEL:-info}
    depends_on:
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - duocafe-network
    healthcheck:
      test: ["CMD", "node", "dist/worker-health.js"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"

  # ─────────────────────────────────────────────
  # Scheduler - Cron Jobs
  # ─────────────────────────────────────────────
  scheduler:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
      target: production
    container_name: duocafe-scheduler
    command: ["node", "dist/scheduler.js"]
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@pgbouncer:6543/${POSTGRES_DB}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - LOG_LEVEL=${LOG_LEVEL:-info}
    depends_on:
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - duocafe-network
    deploy:
      replicas: 1    # SIEMPRE exactamente 1 para evitar crons duplicados
      resources:
        limits:
          memory: 256M
          cpus: "0.25"

  # ─────────────────────────────────────────────
  # Redis - Cache, Colas, Leaderboards
  # ─────────────────────────────────────────────
  redis:
    image: redis:7.2-alpine
    container_name: duocafe-redis
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --maxmemory 384mb
      --maxmemory-policy allkeys-lru
      --appendonly yes
      --appendfsync everysec
    expose:
      - "6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped
    networks:
      - duocafe-network
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
```

### 7.2 Servicios Supabase Self-Hosted

```yaml
  # ─────────────────────────────────────────────
  # SUPABASE: PostgreSQL 15
  # ─────────────────────────────────────────────
  supabase-db:
    image: supabase/postgres:15.6.1.120
    container_name: duocafe-db
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - supabase-db-data:/var/lib/postgresql/data
      - ./database/migrations:/docker-entrypoint-initdb.d
      - wal-archive:/var/lib/postgresql/wal_archive
    command:
      - postgres
      - -c
      - wal_level=replica
      - -c
      - archive_mode=on
      - -c
      - archive_command=cp %p /var/lib/postgresql/wal_archive/%f
      - -c
      - max_wal_senders=3
      - -c
      - shared_buffers=2GB
      - -c
      - effective_cache_size=4GB
      - -c
      - work_mem=16MB
      - -c
      - maintenance_work_mem=512MB
      - -c
      - max_connections=200
      - -c
      - random_page_cost=1.1
      - -c
      - log_min_duration_statement=1000
    expose:
      - "5432"
    restart: unless-stopped
    networks:
      - duocafe-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 6144M
          cpus: "2.0"
        reservations:
          memory: 4096M
          cpus: "1.0"

  # ─────────────────────────────────────────────
  # PgBouncer - Connection Pooling
  # ─────────────────────────────────────────────
  pgbouncer:
    image: edoburu/pgbouncer:1.22.0
    container_name: duocafe-pgbouncer
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@supabase-db:5432/${POSTGRES_DB}
      POOL_MODE: transaction
      MAX_CLIENT_CONN: 300
      DEFAULT_POOL_SIZE: 40
      MIN_POOL_SIZE: 10
    expose:
      - "6543"
    depends_on:
      supabase-db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - duocafe-network
    deploy:
      resources:
        limits:
          memory: 128M
          cpus: "0.25"

  # ─────────────────────────────────────────────
  # Supabase Auth (GoTrue)
  # ─────────────────────────────────────────────
  supabase-auth:
    image: supabase/gotrue:v2.151.0
    container_name: duocafe-auth
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      API_EXTERNAL_URL: https://${DOMAIN}
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@supabase-db:5432/${POSTGRES_DB}?search_path=auth
      GOTRUE_SITE_URL: https://${DOMAIN}
      GOTRUE_URI_ALLOW_LIST: ${ADDITIONAL_REDIRECT_URLS}
      GOTRUE_JWT_SECRET: ${SUPABASE_JWT_SECRET}
      GOTRUE_JWT_EXP: 3600
      GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated
      GOTRUE_EXTERNAL_EMAIL_ENABLED: "true"
      GOTRUE_MAILER_AUTOCONFIRM: "false"
      GOTRUE_SMTP_HOST: ${SMTP_HOST}
      GOTRUE_SMTP_PORT: ${SMTP_PORT}
      GOTRUE_SMTP_USER: ${SMTP_USER}
      GOTRUE_SMTP_PASS: ${SMTP_PASS}
      GOTRUE_SMTP_ADMIN_EMAIL: ${SMTP_ADMIN_EMAIL}
      GOTRUE_SMTP_SENDER_NAME: DuoCafe
      GOTRUE_EXTERNAL_GOOGLE_ENABLED: ${GOOGLE_AUTH_ENABLED:-false}
      GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOTRUE_EXTERNAL_GOOGLE_SECRET: ${GOOGLE_CLIENT_SECRET}
      GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI: https://${DOMAIN}/auth/v1/callback
    expose:
      - "9999"
    depends_on:
      supabase-db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - duocafe-network
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"

  # ─────────────────────────────────────────────
  # Supabase REST (PostgREST)
  # ─────────────────────────────────────────────
  supabase-rest:
    image: postgrest/postgrest:v12.0.3
    container_name: duocafe-rest
    environment:
      PGRST_DB_URI: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@supabase-db:5432/${POSTGRES_DB}
      PGRST_DB_SCHEMAS: public,storage,graphql_public
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: ${SUPABASE_JWT_SECRET}
      PGRST_DB_USE_LEGACY_GUCS: "false"
      PGRST_APP_SETTINGS_JWT_SECRET: ${SUPABASE_JWT_SECRET}
      PGRST_APP_SETTINGS_JWT_EXP: 3600
    expose:
      - "3000"
    depends_on:
      supabase-db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - duocafe-network
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"

  # ─────────────────────────────────────────────
  # Supabase Realtime
  # ─────────────────────────────────────────────
  supabase-realtime:
    image: supabase/realtime:v2.28.36
    container_name: duocafe-realtime
    environment:
      PORT: 4000
      DB_HOST: supabase-db
      DB_PORT: 5432
      DB_USER: ${POSTGRES_USER}
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      DB_NAME: ${POSTGRES_DB}
      DB_AFTER_CONNECT_QUERY: "SET search_path TO _realtime"
      DB_ENC_KEY: ${SUPABASE_REALTIME_ENC_KEY}
      API_JWT_SECRET: ${SUPABASE_JWT_SECRET}
      SECRET_KEY_BASE: ${SUPABASE_REALTIME_SECRET_KEY_BASE}
      ERL_AFLAGS: "-proto_dist inet_tcp"
      DNS_NODES: "''"
      RLIMIT_NOFILE: 10000
    expose:
      - "4000"
    depends_on:
      supabase-db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - duocafe-network
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"

  # ─────────────────────────────────────────────
  # Supabase Storage
  # ─────────────────────────────────────────────
  supabase-storage:
    image: supabase/storage-api:v1.0.6
    container_name: duocafe-storage
    environment:
      ANON_KEY: ${SUPABASE_ANON_KEY}
      SERVICE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
      POSTGREST_URL: http://supabase-rest:3000
      PGRST_JWT_SECRET: ${SUPABASE_JWT_SECRET}
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@supabase-db:5432/${POSTGRES_DB}
      FILE_SIZE_LIMIT: 10485760  # 10MB
      STORAGE_BACKEND: file
      FILE_STORAGE_BACKEND_PATH: /var/lib/storage
      REGION: us-east-1
      GLOBAL_S3_BUCKET: duocafe-storage
    volumes:
      - supabase-storage-data:/var/lib/storage
    expose:
      - "5000"
    depends_on:
      supabase-db:
        condition: service_healthy
      supabase-rest:
        condition: service_started
    restart: unless-stopped
    networks:
      - duocafe-network
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.25"

  # ─────────────────────────────────────────────
  # Supabase Kong (API Gateway)
  # ─────────────────────────────────────────────
  supabase-kong:
    image: kong:2.8.1
    container_name: duocafe-kong
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /var/lib/kong/kong.yml
      KONG_DNS_ORDER: LAST,A,CNAME
      KONG_PLUGINS: request-transformer,cors,key-auth,acl,basic-auth
      KONG_NGINX_PROXY_PROXY_BUFFER_SIZE: 160k
      KONG_NGINX_PROXY_PROXY_BUFFERS: 64 160k
    volumes:
      - ./docker/supabase/kong.yml:/var/lib/kong/kong.yml:ro
    expose:
      - "8000"
    depends_on:
      - supabase-auth
      - supabase-rest
      - supabase-realtime
      - supabase-storage
    restart: unless-stopped
    networks:
      - duocafe-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.supabase.rule=Host(`supabase.${DOMAIN}`)"
      - "traefik.http.routers.supabase.entrypoints=websecure"
      - "traefik.http.routers.supabase.tls.certresolver=letsencrypt"
      - "traefik.http.services.supabase.loadbalancer.server.port=8000"
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: "0.25"

  # ─────────────────────────────────────────────
  # Supabase Studio (Dashboard Admin)
  # ─────────────────────────────────────────────
  supabase-studio:
    image: supabase/studio:20240422-5cf8f30
    container_name: duocafe-studio
    environment:
      STUDIO_PG_META_URL: http://supabase-meta:8080
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      DEFAULT_ORGANIZATION_NAME: DuoCafe
      DEFAULT_PROJECT_NAME: DuoCafe
      SUPABASE_URL: http://supabase-kong:8000
      SUPABASE_PUBLIC_URL: https://supabase.${DOMAIN}
      SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
    expose:
      - "3000"
    depends_on:
      - supabase-kong
      - supabase-meta
    restart: unless-stopped
    networks:
      - duocafe-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.studio.rule=Host(`studio.${DOMAIN}`)"
      - "traefik.http.routers.studio.entrypoints=websecure"
      - "traefik.http.routers.studio.tls.certresolver=letsencrypt"
      - "traefik.http.routers.studio.middlewares=auth-dashboard"
      - "traefik.http.services.studio.loadbalancer.server.port=3000"
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: "0.25"

  # ─────────────────────────────────────────────
  # Supabase Meta
  # ─────────────────────────────────────────────
  supabase-meta:
    image: supabase/postgres-meta:v0.80.0
    container_name: duocafe-meta
    environment:
      PG_META_PORT: 8080
      PG_META_DB_HOST: supabase-db
      PG_META_DB_PORT: 5432
      PG_META_DB_NAME: ${POSTGRES_DB}
      PG_META_DB_USER: ${POSTGRES_USER}
      PG_META_DB_PASSWORD: ${POSTGRES_PASSWORD}
    expose:
      - "8080"
    depends_on:
      supabase-db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - duocafe-network

# ─────────────────────────────────────────────
# REDES Y VOLUMENES
# ─────────────────────────────────────────────

networks:
  duocafe-network:
    driver: bridge

volumes:
  supabase-db-data:
    driver: local
  supabase-storage-data:
    driver: local
  redis-data:
    driver: local
  traefik-letsencrypt:
    driver: local
  traefik-logs:
    driver: local
  wal-archive:
    driver: local
```

### 7.3 Comandos de Escalado

```bash
# Escalar API a 3 instancias (Traefik balancea automaticamente)
docker compose up -d --scale nestjs-api=3

# Escalar workers para mayor throughput de colas
docker compose up -d --scale worker=2

# Scheduler SIEMPRE debe ser 1 replica
# (no escalar para evitar crons duplicados)
```

---

## 8. Backups PostgreSQL con WAL Archiving

### 8.1 Configuracion de WAL Archiving

PostgreSQL esta configurado en `docker-compose.yml` con:
```
wal_level=replica
archive_mode=on
archive_command=cp %p /var/lib/postgresql/wal_archive/%f
max_wal_senders=3
```

### 8.2 Script de Base Backup Semanal

```bash
#!/bin/bash
# backups/scripts/base-backup.sh
# Ejecutar como cron semanal en el host

BACKUP_DIR="/opt/duocafe/backups/base"
CONTAINER="duocafe-db"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=28  # 4 semanas

# Crear directorio
mkdir -p ${BACKUP_DIR}

# Ejecutar pg_basebackup dentro del contenedor
docker exec ${CONTAINER} pg_basebackup \
  -U ${POSTGRES_USER} \
  -D /tmp/backup_${DATE} \
  -Ft -z -P

# Copiar backup fuera del contenedor
docker cp ${CONTAINER}:/tmp/backup_${DATE} ${BACKUP_DIR}/base_${DATE}

# Limpiar backup temporal dentro del contenedor
docker exec ${CONTAINER} rm -rf /tmp/backup_${DATE}

# Copiar WAL archive
cp -r /var/lib/docker/volumes/duocafe_wal-archive/_data/* \
  ${BACKUP_DIR}/wal_${DATE}/

# Opcional: subir a almacenamiento externo (S3/Backblaze B2)
# rclone copy ${BACKUP_DIR}/base_${DATE} remote:duocafe-backups/base/
# rclone copy ${BACKUP_DIR}/wal_${DATE} remote:duocafe-backups/wal/

# Limpiar backups antiguos
find ${BACKUP_DIR} -type d -mtime +${RETENTION_DAYS} -exec rm -rf {} +

echo "[$(date)] Base backup completado: base_${DATE}"
```

### 8.3 Script de Point-in-Time Recovery

```bash
#!/bin/bash
# backups/scripts/restore-pitr.sh
# Restaurar a un punto especifico en el tiempo

BACKUP_BASE=$1          # Path al base backup
TARGET_TIME=$2          # ej: "2026-02-14 15:30:00"
RESTORE_DIR="/tmp/pg_restore"

echo "Restaurando desde: ${BACKUP_BASE}"
echo "Hasta: ${TARGET_TIME}"

# 1. Detener servicios que dependen de la BD
docker compose stop nestjs-api worker scheduler

# 2. Detener PostgreSQL
docker compose stop supabase-db

# 3. Restaurar base backup
rm -rf ${RESTORE_DIR}
mkdir -p ${RESTORE_DIR}
tar -xzf ${BACKUP_BASE}/base.tar.gz -C ${RESTORE_DIR}

# 4. Configurar recovery
cat > ${RESTORE_DIR}/recovery.conf <<EOF
restore_command = 'cp /var/lib/postgresql/wal_archive/%f %p'
recovery_target_time = '${TARGET_TIME}'
recovery_target_action = 'promote'
EOF

# 5. Reemplazar datos
# (requiere montar el volumen correcto)
docker compose up -d supabase-db

# 6. Reiniciar servicios
docker compose up -d nestjs-api worker scheduler

echo "Restauracion PITR completada"
```

### 8.4 Cron del Host para Backups

```cron
# /etc/cron.d/duocafe-backups

# Base backup semanal (domingos a las 03:00)
0 3 * * 0 root /opt/duocafe/backups/scripts/base-backup.sh >> /var/log/duocafe-backup.log 2>&1

# Limpiar WAL archive viejo (diario a las 04:00)
0 4 * * * root find /var/lib/docker/volumes/duocafe_wal-archive/_data -mtime +7 -delete

# Verificar que WAL archiving esta funcionando (cada 6 horas)
0 */6 * * * root /opt/duocafe/backups/scripts/check-wal-lag.sh
```

### 8.5 Retencion

| Tipo | Retencion | Ubicacion |
|------|-----------|-----------|
| WAL segments | 7 dias | Volumen Docker `wal-archive` |
| Base backup | 4 semanas (4 backups) | `/opt/duocafe/backups/base` |
| Copia externa | 30 dias | S3 / Backblaze B2 (opcional) |

---

## 9. Distribucion de Recursos (8 vCPU / 24GB RAM)

| Servicio | CPU Limite | RAM Limite | RAM Reserva | Notas |
|----------|-----------|-----------|------------|-------|
| PostgreSQL | 2.0 | 6 GB | 4 GB | shared_buffers=2GB, effective_cache_size=4GB |
| NestJS API (x2) | 1.0 c/u | 1 GB c/u | 512 MB c/u | Escalable a 3+ replicas |
| Redis | 0.5 | 512 MB | 256 MB | maxmemory 384mb, AOF enabled |
| BullMQ Worker | 0.5 | 512 MB | 256 MB | Escalable |
| Scheduler | 0.25 | 256 MB | 128 MB | Siempre 1 replica |
| Traefik | 0.25 | 256 MB | 128 MB | Ligero, eficiente |
| GoTrue (Auth) | 0.5 | 512 MB | 256 MB | |
| PostgREST | 0.5 | 512 MB | 256 MB | |
| Realtime | 0.5 | 512 MB | 256 MB | WebSocket connections |
| Storage API | 0.25 | 512 MB | 256 MB | File uploads |
| Kong (Gateway) | 0.25 | 256 MB | 128 MB | |
| Studio (Dashboard) | 0.25 | 256 MB | 128 MB | Bajo uso, solo admin |
| PgBouncer | 0.25 | 128 MB | 64 MB | Muy ligero |
| **Reserva SO + overhead** | ~1.0 | ~2 GB | - | Buffer del sistema |
| **TOTAL** | **~8** | **~14 GB** | - | **Margen libre: ~10 GB** |

El margen de ~10 GB permite:
- Escalar NestJS API a 3-4 replicas
- Agregar un segundo worker
- Cache del sistema operativo (file system cache aprovechado por PostgreSQL)
- Picos de memoria temporales

---

## 10. Estructura Monorepo

```
duocafe/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, test, build en PR
│       ├── deploy-api.yml            # Deploy API al VPS
│       └── deploy-web.yml            # Deploy PWA
│
├── apps/
│   ├── web/                          # Next.js PWA
│   │   ├── public/
│   │   │   ├── manifest.json
│   │   │   ├── sw.js                 # Service worker
│   │   │   └── icons/
│   │   ├── src/
│   │   │   ├── app/                  # Next.js App Router
│   │   │   │   ├── (auth)/           # Login, registro, recuperar password
│   │   │   │   ├── (consumer)/       # Paginas del consumidor
│   │   │   │   │   ├── home/
│   │   │   │   │   ├── learn/        # Rutas, lecciones
│   │   │   │   │   ├── catalog/      # Productos
│   │   │   │   │   ├── rewards/      # Canje de Cerezas
│   │   │   │   │   ├── producers/
│   │   │   │   │   ├── leagues/
│   │   │   │   │   ├── profile/
│   │   │   │   │   └── notifications/
│   │   │   │   ├── (admin)/          # Panel admin
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── users/
│   │   │   │   │   ├── content/
│   │   │   │   │   ├── challenges/
│   │   │   │   │   ├── badges/
│   │   │   │   │   └── producers/
│   │   │   │   ├── (brand)/          # Panel marca
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── products/
│   │   │   │   │   ├── codes/
│   │   │   │   │   └── rewards/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/               # Design system
│   │   │   │   ├── lessons/          # UI de lecciones/ejercicios
│   │   │   │   ├── gamification/     # XP bar, racha, corazones
│   │   │   │   ├── catalog/
│   │   │   │   ├── admin/
│   │   │   │   └── brand/
│   │   │   ├── hooks/
│   │   │   │   ├── use-auth.ts
│   │   │   │   ├── use-profile.ts
│   │   │   │   ├── use-streak.ts
│   │   │   │   └── use-supabase.ts
│   │   │   ├── lib/
│   │   │   │   ├── supabase/
│   │   │   │   │   ├── client.ts     # Supabase browser client
│   │   │   │   │   └── server.ts     # Supabase server client (RSC)
│   │   │   │   └── api-client.ts     # NestJS API client
│   │   │   ├── stores/               # Zustand state management
│   │   │   └── styles/
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── mobile/                       # Flutter App
│   │   ├── android/
│   │   ├── ios/
│   │   ├── lib/
│   │   │   ├── main.dart
│   │   │   ├── app/
│   │   │   │   ├── app.dart
│   │   │   │   ├── routes.dart
│   │   │   │   └── theme.dart
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── onboarding/
│   │   │   │   ├── home/
│   │   │   │   ├── lessons/
│   │   │   │   ├── profile/
│   │   │   │   ├── catalog/
│   │   │   │   ├── rewards/
│   │   │   │   ├── producers/
│   │   │   │   ├── leagues/
│   │   │   │   └── notifications/
│   │   │   ├── core/
│   │   │   │   ├── api/              # API client, interceptors
│   │   │   │   ├── auth/             # Supabase auth
│   │   │   │   ├── storage/          # Local/secure storage
│   │   │   │   └── push/             # FCM
│   │   │   ├── shared/
│   │   │   │   ├── widgets/          # Widgets reutilizables
│   │   │   │   ├── models/           # Modelos de datos
│   │   │   │   └── utils/
│   │   │   └── generated/
│   │   ├── test/
│   │   ├── pubspec.yaml
│   │   └── analysis_options.yaml
│   │
│   └── api/                          # NestJS Backend
│       ├── src/                      # (estructura en Seccion 5.1)
│       │   ├── main.ts
│       │   ├── worker.ts             # Entry point del worker BullMQ
│       │   ├── scheduler.ts          # Entry point del scheduler
│       │   └── app.module.ts
│       ├── test/
│       ├── Dockerfile
│       ├── tsconfig.json
│       ├── nest-cli.json
│       └── package.json
│
├── packages/
│   └── shared/                       # Tipos, constantes, utilidades compartidas
│       ├── src/
│       │   ├── types/
│       │   │   ├── user.types.ts
│       │   │   ├── gamification.types.ts
│       │   │   ├── lesson.types.ts
│       │   │   ├── product.types.ts
│       │   │   ├── league.types.ts
│       │   │   ├── badge.types.ts
│       │   │   └── api.types.ts
│       │   ├── constants/
│       │   │   ├── levels.ts         # Nombres de nivel, umbrales XP
│       │   │   ├── rewards.ts        # XP/Cerezas por accion
│       │   │   ├── leagues.ts        # Nombres de liga, reglas de promocion
│       │   │   └── hearts.ts         # Max corazones, tiempo regeneracion
│       │   ├── validators/           # Schemas de validacion (zod)
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── docker/
│   ├── supabase/
│   │   └── kong.yml                  # Configuracion de Kong para Supabase
│   └── scripts/
│       └── init-redis.sh
│
├── database/
│   ├── migrations/                   # Migraciones SQL
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_functions_triggers.sql
│   │   └── ...
│   └── seeds/
│       ├── 001_la_rosa_brand.sql
│       ├── 002_initial_routes_lessons.sql
│       ├── 003_initial_badges.sql
│       ├── 004_sample_producers.sql
│       └── 005_daily_challenges_pool.sql
│
├── backups/
│   └── scripts/
│       ├── base-backup.sh
│       ├── restore-pitr.sh
│       └── check-wal-lag.sh
│
├── docs/
│   ├── api-reference.md
│   ├── deployment.md
│   ├── database-schema.md
│   └── runbook.md
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── docker-compose.dev.yml            # Overrides de desarrollo
├── turbo.json                        # Turborepo config
├── package.json                      # Root workspace
├── pnpm-workspace.yaml
└── README.md
```

### Herramientas del Monorepo

- **Package Manager:** pnpm (workspaces, instalaciones rapidas, resolucion estricta)
- **Task Runner:** Turborepo (builds paralelos, caching, graph de dependencias)
- **Paquete compartido:** `@duocafe/shared` consumido por `apps/web` y `apps/api` via workspace
- **Flutter:** No participa en el workspace de Node.js. Modelos Dart se sincronizan manualmente o via script de generacion de TypeScript a Dart

---

## 11. Seguridad

### 11.1 RLS Policies (Supabase)

RLS habilitado en todas las tablas publicas. Politicas bajo principio de minimo privilegio.

```sql
-- Usuarios pueden leer su propio perfil
CREATE POLICY "Users read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Lectura publica limitada (para ligas)
CREATE POLICY "Public profile read" ON public.user_profiles
    FOR SELECT USING (true);
    -- Nota: limitar columnas via vista o cliente

-- Usuarios actualizan su propio perfil
CREATE POLICY "Users update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Productos activos son publicos
CREATE POLICY "Public read active products" ON public.products
    FOR SELECT USING (is_active = true);

-- Admin de marca gestiona sus productos
CREATE POLICY "Brand admin manages products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'brand_admin'
            AND brand_id = products.brand_id
        )
    );

-- Progreso privado por usuario
CREATE POLICY "Users own progress" ON public.user_lesson_progress
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Notificaciones privadas
CREATE POLICY "Users own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
```

**CRITICO:** Todas las escrituras de gamificacion (XP, Cerezas, rachas, corazones, badges) pasan por NestJS usando `service_role` key, evitando RLS. Esto previene que clientes se asignen XP o Cerezas manipulando Supabase directamente.

### 11.2 Flujo JWT

```
1. Usuario hace login via Supabase Auth (SDK del cliente)
2. Supabase retorna:
   - access_token (JWT, expira en 1hr)
   - refresh_token (larga duracion)
3. Cliente almacena tokens:
   - PWA: httpOnly cookie (via Supabase SSR helpers) o in-memory + localStorage
   - Flutter: flutter_secure_storage
4. Cliente envia: Authorization: Bearer <access_token> a NestJS
5. NestJS verifica JWT usando JWKS de Supabase (clave publica cacheada en memoria)
6. NestJS extrae: sub (user_id), role (de app_metadata), email
7. Al expirar, cliente usa refresh_token con Supabase para obtener nuevo access_token
8. NestJS nunca ve el refresh_token
```

### 11.3 Medidas de Seguridad API

| Medida | Implementacion |
|--------|---------------|
| **Validacion de input** | class-validator + class-transformer en todos los DTOs. Whitelist de propiedades |
| **SQL injection** | Queries parametrizadas via TypeORM/Prisma. Nunca interpolacion de strings |
| **XSS** | Next.js auto-escapa JSX. Content-Security-Policy via Traefik |
| **CORS** | NestJS con `CORS_ORIGINS` explicita. Sin wildcards en produccion |
| **Rate limiting** | Doble capa: Traefik middleware + NestJS guard (ver Seccion 5.4) |
| **Secrets** | En `.env` (nunca en imagen Docker). `.env` en `.gitignore` |
| **Helmet** | NestJS `helmet` middleware para headers de seguridad |
| **HTTPS** | Traefik termina SSL. HSTS habilitado. HTTP redirige a HTTPS |
| **Uploads** | Limite de tamano en Supabase Storage (10MB). NestJS valida MIME types |

### 11.4 Secrets de Supabase Self-Hosted

Todos generados localmente (no dependen de Supabase Cloud):

```env
# .env.example

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<generar-password-fuerte>
POSTGRES_DB=duocafe

# Supabase JWT (generar con: openssl rand -base64 32)
SUPABASE_JWT_SECRET=<generar-secret-fuerte>
SUPABASE_ANON_KEY=<generar-jwt-con-rol-anon>
SUPABASE_SERVICE_ROLE_KEY=<generar-jwt-con-rol-service>

# Supabase Realtime
SUPABASE_REALTIME_ENC_KEY=<generar-key>
SUPABASE_REALTIME_SECRET_KEY_BASE=<generar-key-64-chars>

# Redis
REDIS_PASSWORD=<generar-password-fuerte>

# Firebase (Push Notifications)
FCM_SERVICE_ACCOUNT=<base64-encoded-service-account-json>

# Dominio
DOMAIN=duocafe.co
CORS_ORIGINS=https://duocafe.co,https://www.duocafe.co

# SMTP (para emails de auth)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@duocafe.co
SMTP_PASS=<password>
SMTP_ADMIN_EMAIL=noreply@duocafe.co

# Google OAuth (opcional)
GOOGLE_AUTH_ENABLED=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Traefik
ACME_EMAIL=admin@duocafe.co
TRAEFIK_DASHBOARD_AUTH=admin:<htpasswd-hash>

# App
LOG_LEVEL=info
```

---

## 12. Monitoreo y Observabilidad

### 12.1 Logging Estructurado

Logging JSON en todos los servicios con `nestjs-pino`:

```json
{
  "timestamp": "2026-02-14T15:30:00.000Z",
  "level": "info",
  "service": "duocafe-api",
  "traceId": "abc123",
  "userId": "uuid",
  "method": "POST",
  "path": "/api/v1/lessons/uuid/complete",
  "statusCode": 200,
  "durationMs": 45,
  "message": "Leccion completada exitosamente"
}
```

Rotacion de logs via Docker:
```yaml
logging:
  driver: json-file
  options:
    max-size: "50m"
    max-file: "5"
```

### 12.2 Health Checks

**Liveness:** `GET /api/v1/health`
```json
{"status": "ok", "uptime": 86400, "timestamp": "2026-02-14T15:30:00.000Z"}
```

**Readiness:** `GET /api/v1/health/ready`
```json
{
  "status": "ok",
  "checks": {
    "database": {"status": "ok", "responseTimeMs": 5},
    "redis": {"status": "ok", "responseTimeMs": 2},
    "supabase": {"status": "ok", "responseTimeMs": 45}
  }
}
```

**Worker:** Health check HTTP que reporta estado de colas:
```json
{
  "status": "ok",
  "queues": {
    "badge-evaluation": {"waiting": 2, "active": 1, "failed": 0},
    "notifications": {"waiting": 15, "active": 5, "failed": 0}
  }
}
```

### 12.3 Metricas Clave

| Metrica | Fuente | Umbral de Alerta |
|---------|--------|-----------------|
| API response time (p50, p95, p99) | NestJS LoggingInterceptor | p95 > 500ms |
| Request throughput (req/min) | Traefik access logs | Caida > 50% |
| Error rate (5xx / total) | NestJS ExceptionFilter | > 1% |
| Redis memoria usada | `INFO memory` | > 80% maxmemory |
| BullMQ queue depth (waiting) | BullMQ API | badge queue > 1000 |
| BullMQ failed jobs | BullMQ API | Cualquier job fallido |
| DB conexiones activas | `pg_stat_activity` | > 80% del pool |
| PostgreSQL queries lentas | `pg_stat_statements` | Queries > 1 segundo |
| WAL archiving lag | Script custom | > 100 WAL segments sin archivar |
| Disk usage | `df -h` | > 80% |
| DAU / MAU | Redis HyperLogLog | N/A (metrica de negocio) |

### 12.4 Traefik Dashboard

Accesible en `https://traefik.{DOMAIN}` (protegido con basic auth):
- Routing activo y estado de servicios
- Metricas de throughput por router
- TLS certificates status
- Health de backends (servicios)

### 12.5 Alertas (MVP)

Script cron en el host que verifica umbrales y envia notificaciones:

```bash
# Verificar salud cada 5 minutos
*/5 * * * * /opt/duocafe/scripts/health-alert.sh

# Verificar espacio en disco cada hora
0 * * * * /opt/duocafe/scripts/disk-alert.sh

# Verificar WAL archiving cada 6 horas
0 */6 * * * /opt/duocafe/backups/scripts/check-wal-lag.sh
```

Canales de alerta: Telegram bot o email.

**Futuro:** Prometheus + Grafana para monitoreo en tiempo real con dashboards.

---

## 13. Decisiones Arquitectonicas Clave

| Decision | Razon |
|----------|-------|
| Supabase self-hosted | Control total de datos, independencia de cloud, cumplimiento de datos en jurisdiccion propia |
| Traefik como proxy | Auto-discovery Docker, SSL automatico, escalado sin reload, dashboard built-in |
| NestJS para logica de negocio | Type-safe, modular, testable; la logica de gamificacion requiere validacion compleja que no debe vivir en el cliente ni en RLS |
| Redis self-hosted | Control total sobre estructuras (sorted sets para leaderboards, HyperLogLog para DAU); BullMQ requiere acceso directo a Redis |
| BullMQ para procesamiento asincrono | Battle-tested en Node.js; delayed jobs para corazones; scheduling tipo cron |
| Monorepo con tipos compartidos | Fuente unica de verdad para tipos, umbrales de nivel, valores de XP; evita drift entre frontend y backend |
| Docker Compose en VPS | Costo-efectivo para MVP; control total; escalado horizontal facil con replicas |
| Bloqueo optimista para balances | Previene race conditions en Cerezas/Granos sin bloqueos pesimistas que reducirian throughput |
| Scheduler separado | Al escalar API a multiples instancias, solo un scheduler debe ejecutar crons para evitar duplicados |
| Lecturas directas a Supabase para datos publicos | Reduce carga en NestJS para paginas read-heavy (catalogo, productores); RLS garantiza seguridad |
| WAL archiving para backups | Point-in-time recovery permite restaurar a cualquier momento; esencial para datos de gamificacion y transacciones |

---

*Documento creado: 14 de febrero de 2026*
*Proyecto: DuoCafe — Arquitectura Tecnica*
*Stack: Next.js + Flutter + NestJS + Supabase Self-Hosted + Redis + Traefik + Docker*
*Infraestructura: VPS 8 vCPU / 24GB RAM*
