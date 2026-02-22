// =============================================================
// Tipos del módulo de aprendizaje — Sprint 2
// =============================================================

export type ExerciseType = 'multiple_choice' | 'true_false' | 'matching' | 'ordering'

export type LessonStatus = 'not_started' | 'in_progress' | 'completed'

// ----------------------------------------------------------
// Entidades de contenido
// ----------------------------------------------------------

export interface LearningPath {
  id: string
  title: string
  description: string | null
  order_index: number
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  path_id: string
  title: string
  description: string | null
  order_index: number
  is_active: boolean
  granos_reward: number
  cerezas_reward: number
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: string
  lesson_id: string
  type: ExerciseType
  question: string
  options: unknown       // JSONB — estructura varía según type
  correct_answer: unknown // JSONB — estructura varía según type
  explanation: string | null
  image_url: string | null
  order_index: number
  created_at: string
  updated_at: string
}

// Opciones por tipo de ejercicio
export interface MultipleChoiceOption {
  id: string
  text: string
}

export interface MatchingItem {
  id: string
  left: string
  right: string
}

export interface OrderingItem {
  id: string
  text: string
}

// ----------------------------------------------------------
// Progreso del usuario
// ----------------------------------------------------------

export interface UserLessonProgress {
  id: string
  user_id: string
  lesson_id: string
  status: LessonStatus
  score: number | null
  attempts: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface UserHearts {
  user_id: string
  hearts_remaining: number
  next_regen_at: string | null
  updated_at: string
}

// ----------------------------------------------------------
// Onboarding
// ----------------------------------------------------------

export interface OnboardingQuestion {
  id: string
  question: string
  options: Array<{ id: string; text: string }>
  correct_option: string
  level_points: number
  order_index: number
  is_active: boolean
}

// ----------------------------------------------------------
// DTOs de respuesta del API
// ----------------------------------------------------------

export interface LessonWithExercises extends Lesson {
  exercises: Exercise[]
}

export interface LessonWithProgress extends Lesson {
  progress?: UserLessonProgress
}

export interface PathWithLessons extends LearningPath {
  lessons: LessonWithProgress[]
}

export interface CompleteLessonResult {
  granos_earned: number
  cerezas_earned: number
  new_total_granos: number
  new_cerezas_balance: number
  level_up: boolean
  new_level?: number
  new_level_title?: string
}

export interface QuizSubmitResult {
  assigned_level: number
  correct_count: number
  total_questions: number
}

export interface HeartsState {
  hearts_remaining: number
  next_regen_at: string | null
}

// ----------------------------------------------------------
// DTOs de entrada (admin)
// ----------------------------------------------------------

export interface CreatePathDto {
  title: string
  description?: string
  order_index: number
  image_url?: string
}

export interface UpdatePathDto extends Partial<CreatePathDto> {
  is_active?: boolean
}

export interface CreateLessonDto {
  path_id: string
  title: string
  description?: string
  order_index: number
  granos_reward?: number
  cerezas_reward?: number
}

export interface UpdateLessonDto extends Partial<Omit<CreateLessonDto, 'path_id'>> {
  is_active?: boolean
}

export interface CreateExerciseDto {
  lesson_id: string
  type: ExerciseType
  question: string
  options: unknown
  correct_answer: unknown
  explanation?: string
  image_url?: string
  order_index: number
}

export interface UpdateExerciseDto extends Partial<Omit<CreateExerciseDto, 'lesson_id' | 'type'>> {}
