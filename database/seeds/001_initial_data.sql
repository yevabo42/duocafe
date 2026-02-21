-- =================================================
-- DUOCAFE - Seed 001: Datos Iniciales
-- Marca La Rosa (co-fundadora) + instrucciones admin
-- =================================================

-- =================================================
-- MARCA: La Rosa (marca co-fundadora)
-- =================================================

INSERT INTO public.brands (
    id,
    name,
    slug,
    description,
    whatsapp_number,
    is_founding_brand,
    plan_tier,
    is_active
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  -- UUID fijo para referenciar en seeds
    'La Rosa',
    'la-rosa',
    'La marca co-fundadora del ecosistema DuoCafé. Especialistas en café de origen colombiano, tostado artesanal y experiencias de degustación únicas.',
    NULL,
    TRUE,
    'fundador',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

-- =================================================
-- INSTRUCCIONES: Crear usuario admin manual
-- =================================================
-- El usuario admin de la plataforma NO se puede crear via seed SQL
-- porque requiere que auth.users exista primero (via GoTrue).
--
-- Para crear el admin inicial, ejecuta este script UNA VEZ despues
-- de que Supabase este corriendo:
--
--   1. Registra el usuario via Supabase Studio o API:
--      POST /auth/v1/admin/users
--      {
--        "email": "admin@duocafe.co",
--        "password": "<password-seguro>",
--        "email_confirm": true,
--        "user_metadata": { "display_name": "Admin DuoCafé" }
--      }
--
--   2. Copia el UUID generado y ejecuta:
--      UPDATE public.user_profiles
--      SET role = 'platform_admin'
--      WHERE id = '<uuid-del-admin>';
--
--   3. Para crear el brand_admin de La Rosa:
--      - Registra usuario: brand_admin@larosa.co
--      - Luego ejecuta:
--        UPDATE public.user_profiles
--        SET role = 'brand_admin',
--            brand_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
--        WHERE id = '<uuid-brand-admin>';
-- =================================================

-- =================================================
-- VERIFICACION
-- =================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.brands WHERE slug = 'la-rosa') THEN
        RAISE NOTICE 'OK: Marca La Rosa creada correctamente (slug: la-rosa, plan: fundador)';
    ELSE
        RAISE EXCEPTION 'ERROR: No se pudo crear la marca La Rosa';
    END IF;
END
$$;
