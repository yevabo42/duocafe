-- =============================================================
-- Migración 006: Políticas RLS para tablas de Sprint 2
-- Lectura pública donde corresponde, escritura restringida a service_role
-- =============================================================

-- =============================================================
-- learning_paths: lectura pública (solo activas), escritura service_role
-- =============================================================
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learning_paths_select_active"
  ON public.learning_paths
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "learning_paths_all_service"
  ON public.learning_paths
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- lessons: lectura pública (solo activas), escritura service_role
-- =============================================================
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lessons_select_active"
  ON public.lessons
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "lessons_all_service"
  ON public.lessons
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- exercises: lectura pública, escritura service_role
-- =============================================================
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercises_select_public"
  ON public.exercises
  FOR SELECT
  USING (true);

CREATE POLICY "exercises_all_service"
  ON public.exercises
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- user_lesson_progress: ver/modificar solo el propio
-- =============================================================
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_select_own"
  ON public.user_lesson_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "progress_insert_own"
  ON public.user_lesson_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_update_own"
  ON public.user_lesson_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "progress_all_service"
  ON public.user_lesson_progress
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- user_hearts: ver solo los propios, escritura service_role
-- =============================================================
ALTER TABLE public.user_hearts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hearts_select_own"
  ON public.user_hearts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "hearts_all_service"
  ON public.user_hearts
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- onboarding_questions: lectura pública (solo activas), escritura service_role
-- =============================================================
ALTER TABLE public.onboarding_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_select_active"
  ON public.onboarding_questions
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "quiz_all_service"
  ON public.onboarding_questions
  TO service_role
  USING (true)
  WITH CHECK (true);
