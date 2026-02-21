-- =================================================
-- DUOCAFE - Migracion 003: Triggers
-- Sprint 1: handle_new_user, updated_at
-- =================================================

-- =================================================
-- FUNCION: Actualizar updated_at automaticamente
-- =================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger updated_at para user_profiles
CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Trigger updated_at para brands
CREATE TRIGGER trg_brands_updated_at
    BEFORE UPDATE ON public.brands
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- =================================================
-- FUNCION: Crear perfil de usuario al registrarse
-- Se ejecuta cuando auth.users recibe un INSERT
-- =================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_display_name VARCHAR(100);
    v_referral_code VARCHAR(12);
    v_referred_by_id UUID;
    v_referred_by_code VARCHAR(12);
BEGIN
    -- Generar display_name desde email o metadata
    v_display_name := COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    -- Generar codigo de referido unico (8 chars alfanumerico uppercase)
    LOOP
        v_referral_code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM public.user_profiles WHERE referral_code = v_referral_code
        );
    END LOOP;

    -- Buscar quien refirió a este usuario (si viene en metadata)
    v_referred_by_code := NEW.raw_user_meta_data->>'referral_code';
    IF v_referred_by_code IS NOT NULL THEN
        SELECT id INTO v_referred_by_id
        FROM public.user_profiles
        WHERE referral_code = v_referred_by_code
        LIMIT 1;
    END IF;

    -- Insertar perfil inicial
    INSERT INTO public.user_profiles (
        id,
        display_name,
        referral_code,
        referred_by,
        level,
        level_title,
        total_granos,
        cerezas_balance,
        cerezas_earned_total,
        cerezas_spent_total,
        daily_goal,
        onboarding_completed,
        role,
        push_enabled,
        streak_reminder_enabled,
        version
    ) VALUES (
        NEW.id,
        v_display_name,
        v_referral_code,
        v_referred_by_id,
        1,
        'Curioso',
        0,
        0,
        0,
        0,
        'regular',
        FALSE,
        'consumer',
        TRUE,
        TRUE,
        0
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: ejecutar handle_new_user al crear auth.users
CREATE OR REPLACE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =================================================
-- FUNCION: Generar slug unico para brands
-- =================================================

CREATE OR REPLACE FUNCTION public.generate_brand_slug(p_name TEXT)
RETURNS TEXT AS $$
DECLARE
    v_base_slug TEXT;
    v_slug TEXT;
    v_counter INTEGER := 0;
BEGIN
    -- Normalizar: lowercase, reemplazar espacios/especiales con guion
    v_base_slug := lower(
        regexp_replace(
            regexp_replace(
                translate(p_name,
                    'áéíóúàèìòùäëïöüñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ',
                    'aeiouaeiouaeiounAEIOUAEIOUAEIOUN'
                ),
                '[^a-z0-9\s-]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );

    -- Asegurar unicidad
    v_slug := v_base_slug;
    WHILE EXISTS (SELECT 1 FROM public.brands WHERE slug = v_slug) LOOP
        v_counter := v_counter + 1;
        v_slug := v_base_slug || '-' || v_counter;
    END LOOP;

    RETURN v_slug;
END;
$$ LANGUAGE plpgsql;

-- =================================================
-- Grants para las funciones
-- =================================================
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_brand_slug(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_brand_slug(TEXT) TO authenticated;
