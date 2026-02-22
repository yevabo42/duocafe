-- =================================================
-- DUOCAFE - Migración 007: GRANTs tablas Sprint 2
-- Las migraciones 004-006 crearon las tablas pero omitieron los GRANTs
-- necesarios para que anon, authenticated y service_role accedan via PostgREST
-- =================================================

-- Tablas de contenido educativo (lectura pública, escritura solo service_role)
GRANT SELECT ON public.learning_paths       TO anon;
GRANT SELECT ON public.learning_paths       TO authenticated;
GRANT ALL    ON public.learning_paths       TO service_role;

GRANT SELECT ON public.lessons              TO anon;
GRANT SELECT ON public.lessons              TO authenticated;
GRANT ALL    ON public.lessons              TO service_role;

GRANT SELECT ON public.exercises            TO anon;
GRANT SELECT ON public.exercises            TO authenticated;
GRANT ALL    ON public.exercises            TO service_role;

GRANT SELECT ON public.onboarding_questions TO anon;
GRANT SELECT ON public.onboarding_questions TO authenticated;
GRANT ALL    ON public.onboarding_questions TO service_role;

-- Tablas de progreso y corazones (acceso solo al propio usuario via RLS)
GRANT ALL ON public.user_lesson_progress    TO authenticated;
GRANT ALL ON public.user_lesson_progress    TO service_role;

GRANT ALL ON public.user_hearts             TO authenticated;
GRANT ALL ON public.user_hearts             TO service_role;

-- Función de trigger (necesaria para que el trigger handle_new_user_hearts ejecute)
GRANT EXECUTE ON FUNCTION public.handle_new_user_hearts() TO service_role;
