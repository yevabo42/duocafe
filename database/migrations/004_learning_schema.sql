-- =============================================================
-- Migración 004: Esquema de aprendizaje
-- Rutas de aprendizaje, lecciones, ejercicios y quiz de onboarding
-- =============================================================

-- Rutas de aprendizaje (colecciones de lecciones)
CREATE TABLE public.learning_paths (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  order_index   INTEGER NOT NULL DEFAULT 0,
  image_url     TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lecciones dentro de cada ruta
CREATE TABLE public.lessons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id         UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  order_index     INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  granos_reward   INTEGER NOT NULL DEFAULT 10,
  cerezas_reward  INTEGER NOT NULL DEFAULT 5,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ejercicios dentro de cada lección
-- type: 'multiple_choice' | 'true_false' | 'matching' | 'ordering'
-- options: JSONB con las opciones de respuesta
-- correct_answer: JSONB con la(s) respuesta(s) correcta(s)
CREATE TABLE public.exercises (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id      UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  type           VARCHAR(30) NOT NULL CHECK (type IN ('multiple_choice','true_false','matching','ordering')),
  question       TEXT NOT NULL,
  options        JSONB NOT NULL,
  correct_answer JSONB NOT NULL,
  explanation    TEXT,
  image_url      TEXT,
  order_index    INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Preguntas del quiz de onboarding (3 preguntas fijas para clasificar nivel)
-- options: [{id, text}]
-- correct_option: id de la opción correcta
-- level_points: puntos que aporta al nivel inicial (1 o 2 según respuesta)
CREATE TABLE public.onboarding_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question       TEXT NOT NULL,
  options        JSONB NOT NULL,
  correct_option VARCHAR(10) NOT NULL,
  level_points   INTEGER NOT NULL DEFAULT 1,
  order_index    INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT true
);

-- Índices de rendimiento
CREATE INDEX idx_lessons_path_id    ON public.lessons(path_id);
CREATE INDEX idx_lessons_order      ON public.lessons(path_id, order_index);
CREATE INDEX idx_exercises_lesson_id ON public.exercises(lesson_id);
CREATE INDEX idx_exercises_order    ON public.exercises(lesson_id, order_index);
CREATE INDEX idx_paths_order        ON public.learning_paths(order_index) WHERE is_active = true;
CREATE INDEX idx_onboarding_order   ON public.onboarding_questions(order_index) WHERE is_active = true;
