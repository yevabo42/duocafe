-- =================================================
-- DUOCAFE - Migracion 002: Politicas RLS
-- Sprint 1: user_profiles, brands
-- =================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- =================================================
-- POLITICAS RLS: user_profiles
-- =================================================

-- Los perfiles publicos son visibles para todos
CREATE POLICY "user_profiles_select_public"
    ON public.user_profiles
    FOR SELECT
    USING (true);

-- Solo el propio usuario puede actualizar su perfil
CREATE POLICY "user_profiles_update_own"
    ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        -- Campos criticos de gamificacion NO pueden ser modificados directamente:
        -- level, total_granos, cerezas_balance, version, role, brand_id
        -- Solo NestJS con service_role puede escribirlos
    );

-- Solo service_role puede insertar perfiles (via trigger handle_new_user)
CREATE POLICY "user_profiles_insert_service"
    ON public.user_profiles
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Solo service_role puede actualizar campos de gamificacion
CREATE POLICY "user_profiles_update_service"
    ON public.user_profiles
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Solo service_role puede eliminar perfiles
CREATE POLICY "user_profiles_delete_service"
    ON public.user_profiles
    FOR DELETE
    TO service_role
    USING (true);

-- =================================================
-- POLITICAS RLS: brands
-- =================================================

-- Las marcas activas son visibles para todos
CREATE POLICY "brands_select_public"
    ON public.brands
    FOR SELECT
    USING (is_active = true);

-- Los admins autenticados pueden ver todas las marcas (incluso inactivas)
CREATE POLICY "brands_select_admin"
    ON public.brands
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'platform_admin'
        )
    );

-- Solo service_role puede crear/editar/eliminar marcas
CREATE POLICY "brands_insert_service"
    ON public.brands
    FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "brands_update_service"
    ON public.brands
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "brands_delete_service"
    ON public.brands
    FOR DELETE
    TO service_role
    USING (true);

-- Un brand_admin puede ver su propia marca aunque este inactiva
CREATE POLICY "brands_select_own_admin"
    ON public.brands
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'brand_admin'
            AND brand_id = brands.id
        )
    );
