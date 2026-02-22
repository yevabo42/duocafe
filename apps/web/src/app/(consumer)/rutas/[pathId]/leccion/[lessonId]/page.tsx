'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { HeartsDisplay } from '@/components/learning/hearts-display';
import { ProgressBar } from '@/components/learning/progress-bar';
import { ExerciseMultipleChoice } from '@/components/learning/exercise-multiple-choice';
import { ExerciseTrueFalse } from '@/components/learning/exercise-true-false';
import { ExerciseMatching } from '@/components/learning/exercise-matching';
import { ExerciseOrdering } from '@/components/learning/exercise-ordering';
import { Button } from '@/components/ui/button';
import { useLessonStore } from '@/store/lesson.store';
import type {
  CompleteLessonResult,
  Exercise,
  LessonWithExercises,
  MatchingItem,
  MultipleChoiceOption,
  OrderingItem,
} from '@duocafe/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

interface PageProps {
  params: { pathId: string; lessonId: string };
}

type AnswerState = 'idle' | 'correct' | 'wrong';

export default function LeccionPage({ params }: PageProps) {
  const router = useRouter();
  const { lessonId, pathId } = params;

  const { setLesson, recordAnswer, nextExercise, exerciseIndex, answers, reset } = useLessonStore();

  const [lesson, setLessonData] = useState<LessonWithExercises | null>(null);
  const [heartsRemaining, setHeartsRemaining] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado del ejercicio actual
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [selectedAnswer, setSelectedAnswer] = useState<unknown>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [noHeartsModal, setNoHeartsModal] = useState(false);

  // Resultado final
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<CompleteLessonResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Cargar lección y corazones al montar
  useEffect(() => {
    async function cargar() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }

        const [lessonRes, heartsRes] = await Promise.all([
          fetch(`${API_URL}/learning/lessons/${lessonId}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
          fetch(`${API_URL}/hearts`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
        ]);

        if (!lessonRes.ok) throw new Error('Lección no encontrada');
        const lessonData: LessonWithExercises = await lessonRes.json();

        let hearts = 5;
        if (heartsRes.ok) {
          const heartsData = await heartsRes.json();
          hearts = heartsData.hearts_remaining ?? 5;
        }

        setLessonData(lessonData);
        setHeartsRemaining(hearts);
        setLesson(lessonId, hearts);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar la lección');
      } finally {
        setLoading(false);
      }
    }
    cargar();

    return () => reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const currentExercise: Exercise | undefined = lesson?.exercises[exerciseIndex];

  const handleAnswer = useCallback(async (answer: unknown, isCorrect: boolean) => {
    if (answerState !== 'idle') return;

    setSelectedAnswer(answer);
    setAnswerState(isCorrect ? 'correct' : 'wrong');
    setExplanation(currentExercise?.explanation ?? null);

    if (!isCorrect) {
      // Gastar corazón
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const res = await fetch(`${API_URL}/hearts/spend`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const newHearts = data.hearts_remaining ?? heartsRemaining - 1;
            setHeartsRemaining(newHearts);
            if (newHearts <= 0) setNoHeartsModal(true);
          }
        }
      } catch { /* silencioso */ }
    }

    recordAnswer(currentExercise?.id ?? '', isCorrect);
  }, [answerState, currentExercise, heartsRemaining, recordAnswer]);

  const handleContinue = useCallback(async () => {
    if (!lesson) return;

    const isLastExercise = exerciseIndex >= lesson.exercises.length - 1;

    if (isLastExercise) {
      // Completar lección
      setSubmitting(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }

        const correctAnswers = answers.filter((a) => a.correct).length;
        const score = lesson.exercises.length > 0
          ? Math.round((correctAnswers / lesson.exercises.length) * 100)
          : 100;

        const heartsSpent = lesson.exercises.length - correctAnswers;

        const res = await fetch(`${API_URL}/learning/lessons/${lessonId}/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ score, hearts_spent: heartsSpent }),
        });

        if (res.ok) {
          const completionResult: CompleteLessonResult = await res.json();
          setResult(completionResult);
        } else {
          setResult({
            granos_earned: lesson.granos_reward,
            cerezas_earned: lesson.cerezas_reward,
            new_total_granos: 0,
            new_cerezas_balance: 0,
            level_up: false,
          });
        }
        setCompleted(true);
      } finally {
        setSubmitting(false);
      }
    } else {
      nextExercise();
      setAnswerState('idle');
      setSelectedAnswer(null);
      setExplanation(null);
    }
  }, [lesson, exerciseIndex, answers, lessonId, nextExercise, router]);

  // ----------------------------------------------------------
  // Render estados especiales
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-amber-600">Cargando lección...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <div className="text-5xl">😕</div>
        <p className="text-gray-600">{error ?? 'Lección no disponible'}</p>
        <Button onClick={() => router.push(`/rutas/${pathId}`)}>Volver</Button>
      </div>
    );
  }

  // Pantalla de resumen final
  if (completed && result) {
    const correctCount = answers.filter((a) => a.correct).length;
    const totalExercises = lesson.exercises.length;
    const accuracy = totalExercises > 0
      ? Math.round((correctCount / totalExercises) * 100)
      : 100;

    return (
      <div className="flex flex-col items-center justify-between min-h-screen bg-amber-50 px-6 py-12">
        <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center">
          <div className="text-8xl">{accuracy >= 80 ? '🏆' : accuracy >= 60 ? '⭐' : '💪'}</div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-amber-900">¡Lección completada!</h1>
            {result.level_up && (
              <p className="text-lg text-amber-600 font-semibold">
                🎉 ¡Subiste al nivel {result.new_level}!
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-200 text-center">
              <p className="text-3xl font-bold text-amber-600">+{result.granos_earned}</p>
              <p className="text-xs text-gray-500 mt-1">granos</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-200 text-center">
              <p className="text-3xl font-bold text-red-500">+{result.cerezas_earned}</p>
              <p className="text-xs text-gray-500 mt-1">cerezas</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 text-center col-span-2">
              <p className="text-3xl font-bold text-gray-700">{accuracy}%</p>
              <p className="text-xs text-gray-500 mt-1">de precisión</p>
            </div>
          </div>
        </div>

        <div className="w-full space-y-3">
          <Button
            onClick={() => router.push(`/rutas/${pathId}`)}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            Continuar
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/home')}
            className="w-full"
          >
            Ir al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (!currentExercise) return null;

  // ----------------------------------------------------------
  // Motor de ejercicio
  // ----------------------------------------------------------
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header con corazones y progreso */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 z-10">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.push(`/rutas/${pathId}`)}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Salir de la lección"
          >
            ✕
          </button>
          <HeartsDisplay heartsRemaining={heartsRemaining} />
        </div>
        <ProgressBar
          current={exerciseIndex + (answerState !== 'idle' ? 1 : 0)}
          total={lesson.exercises.length}
        />
      </div>

      {/* Ejercicio */}
      <div className="flex-1 px-4 py-8">
        {renderExercise(currentExercise, answerState, selectedAnswer, handleAnswer)}
      </div>

      {/* Feedback y botón continuar */}
      {answerState !== 'idle' && (
        <div className={`px-4 pb-6 pt-4 border-t-2 ${
          answerState === 'correct' ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
        }`}>
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">{answerState === 'correct' ? '✅' : '❌'}</span>
            <div>
              <p className={`font-bold ${answerState === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                {answerState === 'correct' ? '¡Correcto!' : '¡Incorrecto!'}
              </p>
              {explanation && (
                <p className="text-sm text-gray-600 mt-1">{explanation}</p>
              )}
            </div>
          </div>
          <Button
            onClick={handleContinue}
            disabled={submitting}
            className={`w-full ${
              answerState === 'correct'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            } text-white`}
          >
            {submitting ? 'Guardando...' : 'Continuar'}
          </Button>
        </div>
      )}

      {/* Modal: sin corazones */}
      {noHeartsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-3">💔</div>
              <h2 className="text-xl font-bold text-gray-900">¡Sin corazones!</h2>
              <p className="text-gray-600 text-sm mt-2">
                Espera 30 minutos para regenerar un corazón, o gasta 20 cerezas para recuperarlo ahora.
              </p>
            </div>
            <Button
              onClick={async () => {
                try {
                  const supabase = createClient();
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return;
                  const res = await fetch(`${API_URL}/hearts/refill`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${session.access_token}` },
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setHeartsRemaining(data.hearts_remaining);
                    setNoHeartsModal(false);
                  }
                } catch { /* silencioso */ }
              }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              Usar 20 cerezas 🍒
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push(`/rutas/${pathId}`)}
              className="w-full"
            >
              Volver al mapa
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------
// Renderizador de ejercicio según tipo
// ----------------------------------------------------------
function renderExercise(
  exercise: Exercise,
  answerState: AnswerState,
  selectedAnswer: unknown,
  onAnswer: (answer: unknown, correct: boolean) => void,
) {
  const answered = answerState !== 'idle';

  switch (exercise.type) {
    case 'multiple_choice': {
      const options = exercise.options as MultipleChoiceOption[];
      const correctId = (exercise.correct_answer as { id: string }).id;
      return (
        <ExerciseMultipleChoice
          question={exercise.question}
          options={options}
          selectedOption={selectedAnswer as string | null}
          answered={answered}
          correctAnswer={correctId}
          onSelect={(optionId) => onAnswer(optionId, optionId === correctId)}
        />
      );
    }

    case 'true_false': {
      const correctVal = (exercise.correct_answer as { value: boolean }).value;
      return (
        <ExerciseTrueFalse
          question={exercise.question}
          selectedOption={selectedAnswer as boolean | null}
          answered={answered}
          correctAnswer={correctVal}
          onSelect={(val) => onAnswer(val, val === correctVal)}
        />
      );
    }

    case 'matching': {
      const items = exercise.options as MatchingItem[];
      const correctPairs = exercise.correct_answer as Record<string, string>;
      return (
        <ExerciseMatching
          question={exercise.question}
          items={items}
          answered={answered}
          correctPairs={correctPairs}
          onComplete={(userPairs) => {
            const allCorrect = Object.entries(userPairs).every(
              ([left, right]) => correctPairs[left] === right,
            );
            onAnswer(userPairs, allCorrect);
          }}
        />
      );
    }

    case 'ordering': {
      const items = exercise.options as OrderingItem[];
      const correctOrder = exercise.correct_answer as string[];
      return (
        <ExerciseOrdering
          question={exercise.question}
          items={items}
          answered={answered}
          correctOrder={correctOrder}
          onComplete={(userOrder) => {
            const isCorrect = userOrder.every((id, i) => correctOrder[i] === id);
            onAnswer(userOrder, isCorrect);
          }}
        />
      );
    }

    default:
      return <p className="text-center text-gray-500">Tipo de ejercicio no soportado</p>;
  }
}
