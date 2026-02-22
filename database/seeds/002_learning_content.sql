-- =============================================================
-- Seed 002: Contenido inicial de aprendizaje
-- Ruta 1 "Orígenes del Café" + Lección 1.1 + Quiz de onboarding
-- =============================================================

-- ----------------------------------------------------------
-- Ruta 1: Orígenes del Café
-- ----------------------------------------------------------
INSERT INTO public.learning_paths (id, title, description, order_index, is_active)
VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'Orígenes del Café',
  'Descubre de dónde viene el café, su historia, los países productores y cómo llegó a ser la bebida más consumida del mundo.',
  0,
  true
);

-- ----------------------------------------------------------
-- Lección 1.1: ¿De dónde viene el café?
-- ----------------------------------------------------------
INSERT INTO public.lessons (id, path_id, title, description, order_index, granos_reward, cerezas_reward, is_active)
VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001',
  '¿De dónde viene el café?',
  'Aprende sobre el origen geográfico del café, la planta Coffea y los primeros usos históricos.',
  0,
  10,
  5,
  true
);

-- Lección 1.2 (placeholder para futura implementación)
INSERT INTO public.lessons (id, path_id, title, description, order_index, granos_reward, cerezas_reward, is_active)
VALUES (
  'c1000000-0000-0000-0000-000000000002',
  'b1000000-0000-0000-0000-000000000001',
  'La ruta del café al mundo',
  'Cómo el café viajó desde Etiopía hasta convertirse en la bebida más popular del planeta.',
  1,
  10,
  5,
  false  -- No activa hasta que se completen los ejercicios
);

-- ----------------------------------------------------------
-- Ejercicios de la Lección 1.1
-- ----------------------------------------------------------

-- Ejercicio 1: Opción múltiple — Origen del café
INSERT INTO public.exercises (id, lesson_id, type, question, options, correct_answer, explanation, order_index)
VALUES (
  'd1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  'multiple_choice',
  '¿En qué continente se originó el café?',
  '[
    {"id": "a", "text": "América del Sur"},
    {"id": "b", "text": "África"},
    {"id": "c", "text": "Asia"},
    {"id": "d", "text": "Europa"}
  ]'::jsonb,
  '{"id": "b"}'::jsonb,
  'El café es originario de Etiopía, en África Oriental. La leyenda cuenta que fue descubierto por un pastor llamado Kaldi.',
  0
);

-- Ejercicio 2: Opción múltiple — Nombre científico
INSERT INTO public.exercises (id, lesson_id, type, question, options, correct_answer, explanation, order_index)
VALUES (
  'd1000000-0000-0000-0000-000000000002',
  'c1000000-0000-0000-0000-000000000001',
  'multiple_choice',
  '¿Cómo se llama la planta del café?',
  '[
    {"id": "a", "text": "Camellia sinensis"},
    {"id": "b", "text": "Coffea arabica"},
    {"id": "c", "text": "Theobroma cacao"},
    {"id": "d", "text": "Carica papaya"}
  ]'::jsonb,
  '{"id": "b"}'::jsonb,
  'El café pertenece al género Coffea. La especie más consumida es la Coffea arabica, aunque también existe la Coffea robusta.',
  1
);

-- Ejercicio 3: Verdadero o Falso — Etiopía
INSERT INTO public.exercises (id, lesson_id, type, question, options, correct_answer, explanation, order_index)
VALUES (
  'd1000000-0000-0000-0000-000000000003',
  'c1000000-0000-0000-0000-000000000001',
  'true_false',
  'El café fue cultivado por primera vez en Arabia antes de llegar a África.',
  '[
    {"id": "true", "text": "Verdadero"},
    {"id": "false", "text": "Falso"}
  ]'::jsonb,
  '{"value": false}'::jsonb,
  'Falso. El café es originario de Etiopía (África). Desde allí fue llevado a Arabia (Yemen) donde comenzó su cultivo comercial alrededor del siglo XV.',
  2
);

-- Ejercicio 4: Relacionar — Países y sus aportes al café
INSERT INTO public.exercises (id, lesson_id, type, question, options, correct_answer, explanation, order_index)
VALUES (
  'd1000000-0000-0000-0000-000000000004',
  'c1000000-0000-0000-0000-000000000001',
  'matching',
  'Relaciona cada país con su contribución en la historia del café',
  '[
    {"id": "1", "left": "Etiopía",   "right": "Origen y descubrimiento del café"},
    {"id": "2", "left": "Yemen",     "right": "Primer cultivo y comercio del café"},
    {"id": "3", "left": "Brasil",    "right": "Mayor productor mundial de café"},
    {"id": "4", "left": "Colombia",  "right": "Famoso por su café suave de montaña"}
  ]'::jsonb,
  '{"1": "1", "2": "2", "3": "3", "4": "4"}'::jsonb,
  'Cada país jugó un papel único en la historia del café: Etiopía como origen, Yemen como primer cultivador comercial, y América Latina como los grandes productores actuales.',
  3
);

-- Ejercicio 5: Ordenar — Etapas del viaje del café
INSERT INTO public.exercises (id, lesson_id, type, question, options, correct_answer, explanation, order_index)
VALUES (
  'd1000000-0000-0000-0000-000000000005',
  'c1000000-0000-0000-0000-000000000001',
  'ordering',
  'Ordena las etapas del viaje histórico del café de más antigua a más reciente',
  '[
    {"id": "1", "text": "Descubrimiento en Etiopía (siglo IX)"},
    {"id": "2", "text": "Cultivo en Yemen y primeras cafeterías árabes (siglo XV)"},
    {"id": "3", "text": "Llegada del café a Europa (siglo XVII)"},
    {"id": "4", "text": "Expansión a América Latina (siglo XVIII)"}
  ]'::jsonb,
  '["1", "2", "3", "4"]'::jsonb,
  'El café siguió un viaje de Oriente a Occidente: nació en África, se comercializó en Arabia, conquistó Europa y finalmente dominó América Latina.',
  4
);

-- ----------------------------------------------------------
-- Preguntas del Quiz de Onboarding (3 preguntas)
-- ----------------------------------------------------------

-- Pregunta 1: Básica — accesible para principiantes
INSERT INTO public.onboarding_questions (id, question, options, correct_option, level_points, order_index, is_active)
VALUES (
  'e1000000-0000-0000-0000-000000000001',
  '¿Cuál es la diferencia entre un espresso y un americano?',
  '[
    {"id": "a", "text": "El americano lleva leche, el espresso no"},
    {"id": "b", "text": "El americano es espresso con agua caliente, el espresso es puro"},
    {"id": "c", "text": "Son exactamente lo mismo, solo cambia el nombre"},
    {"id": "d", "text": "El espresso se sirve frío y el americano caliente"}
  ]'::jsonb,
  'b',
  1,
  0,
  true
);

-- Pregunta 2: Intermedia — para amantes del café
INSERT INTO public.onboarding_questions (id, question, options, correct_option, level_points, order_index, is_active)
VALUES (
  'e1000000-0000-0000-0000-000000000002',
  '¿Qué significa que un café sea de "origen único" (single origin)?',
  '[
    {"id": "a", "text": "Que solo se puede tomar una vez al día"},
    {"id": "b", "text": "Que proviene de una sola región o finca específica"},
    {"id": "c", "text": "Que fue procesado por una sola persona"},
    {"id": "d", "text": "Que es el primer café cosechado de la planta"}
  ]'::jsonb,
  'b',
  1,
  1,
  true
);

-- Pregunta 3: Avanzada — para conocedores
INSERT INTO public.onboarding_questions (id, question, options, correct_option, level_points, order_index, is_active)
VALUES (
  'e1000000-0000-0000-0000-000000000003',
  '¿Cuál de estos métodos de extracción produce el café con mayor concentración de sabor?',
  '[
    {"id": "a", "text": "Café de goteo (drip coffee)"},
    {"id": "b", "text": "Prensa francesa"},
    {"id": "c", "text": "Espresso"},
    {"id": "d", "text": "Cold brew"}
  ]'::jsonb,
  'c',
  1,
  2,
  true
);
