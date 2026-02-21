-- =================================================
-- DUOCAFE - Migracion 001: Schema Inicial
-- Sprint 1: user_profiles, brands
-- =================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =================================================
-- ROLES DE BASE DE DATOS (para RLS)
-- =================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
END
$$;

GRANT anon TO postgres;
GRANT authenticated TO postgres;
GRANT service_role TO postgres;

-- =================================================
-- TABLA: user_profiles
-- Extiende auth.users de Supabase con datos de la aplicacion
-- =================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,

    -- Gamificacion
    level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 8),
    level_title VARCHAR(50) NOT NULL DEFAULT 'Curioso',
    total_granos INTEGER NOT NULL DEFAULT 0 CHECK (total_granos >= 0),
    cerezas_balance INTEGER NOT NULL DEFAULT 0 CHECK (cerezas_balance >= 0),
    cerezas_earned_total INTEGER NOT NULL DEFAULT 0 CHECK (cerezas_earned_total >= 0),
    cerezas_spent_total INTEGER NOT NULL DEFAULT 0 CHECK (cerezas_spent_total >= 0),

    -- Preferencias
    daily_goal VARCHAR(20) NOT NULL DEFAULT 'regular'
        CHECK (daily_goal IN ('casual', 'regular', 'intenso')),
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    initial_quiz_level INTEGER CHECK (initial_quiz_level BETWEEN 1 AND 2),

    -- Rol y acceso
    role VARCHAR(20) NOT NULL DEFAULT 'consumer'
        CHECK (role IN ('consumer', 'brand_admin', 'platform_admin', 'producer')),
    brand_id UUID,

    -- Referidos
    referral_code VARCHAR(12) UNIQUE NOT NULL,
    referred_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

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

-- Indices
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON public.user_profiles(level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON public.user_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_brand_id ON public.user_profiles(brand_id)
    WHERE brand_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_granos ON public.user_profiles(total_granos DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active ON public.user_profiles(last_active_at DESC)
    WHERE last_active_at IS NOT NULL;

-- Permisos
GRANT SELECT ON public.user_profiles TO anon;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

-- =================================================
-- TABLA: brands
-- Marcas/cafeterias dentro del ecosistema DuoCafe
-- =================================================

CREATE TABLE IF NOT EXISTS public.brands (
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
    is_founding_brand BOOLEAN NOT NULL DEFAULT FALSE,
    plan_tier VARCHAR(20) NOT NULL DEFAULT 'semilla'
        CHECK (plan_tier IN ('semilla', 'cosecha', 'origen_premium', 'fundador')),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_active ON public.brands(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_brands_founding ON public.brands(is_founding_brand) WHERE is_founding_brand = TRUE;

-- Permisos
GRANT SELECT ON public.brands TO anon;
GRANT SELECT ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;

-- Comentarios descriptivos
COMMENT ON TABLE public.user_profiles IS 'Perfil de usuario de DuoCafe, extiende auth.users con datos de gamificacion';
COMMENT ON TABLE public.brands IS 'Marcas/cafeterias del ecosistema DuoCafe';
COMMENT ON COLUMN public.user_profiles.total_granos IS 'XP acumulado (nunca decrece), determina el nivel';
COMMENT ON COLUMN public.user_profiles.cerezas_balance IS 'Moneda virtual canjeable (se puede gastar)';
COMMENT ON COLUMN public.user_profiles.version IS 'Contador para bloqueo optimista en updates concurrentes';
