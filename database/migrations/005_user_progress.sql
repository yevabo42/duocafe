-- =============================================================
-- Migración 005: Progreso de usuarios
-- Progreso de lecciones y sistema de corazones
-- =============================================================

-- Progreso de lecciones por usuario
CREATE TABLE public.user_lesson_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status       VARCHAR(20) NOT NULL DEFAULT 'not_started'
                 CHECK (status IN ('not_started','in_progress','completed')),
  score        INTEGER CHECK (score >= 0 AND score <= 100),  -- % de respuestas correctas
  attempts     INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

-- Corazones del usuario (1:1 con user_profiles)
-- Se crea automáticamente al crear el perfil via trigger
CREATE TABLE public.user_hearts (
  user_id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hearts_remaining INTEGER NOT NULL DEFAULT 5 CHECK (hearts_remaining >= 0 AND hearts_remaining <= 5),
  next_regen_at    TIMESTAMPTZ,  -- null si hearts_remaining = 5
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de rendimiento
CREATE INDEX idx_user_lesson_progress_user   ON public.user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson ON public.user_lesson_progress(lesson_id);
CREATE INDEX idx_user_lesson_progress_status ON public.user_lesson_progress(user_id, status);
-- Índice parcial: solo usuarios con corazones incompletos (para el scheduler)
CREATE INDEX idx_user_hearts_regen ON public.user_hearts(next_regen_at)
  WHERE hearts_remaining < 5;

-- =============================================================
-- Trigger: crear registro de corazones al crear user_profiles
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_hearts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_hearts (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_new_user_hearts
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_hearts();

-- =============================================================
-- Triggers updated_at para tablas nuevas
-- (reutiliza la función set_updated_at() de 003_triggers.sql)
-- =============================================================
CREATE TRIGGER trg_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_user_lesson_progress_updated_at
  BEFORE UPDATE ON public.user_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
