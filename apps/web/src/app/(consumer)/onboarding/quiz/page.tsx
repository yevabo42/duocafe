'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizQuestion } from '@/components/onboarding/quiz-question';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { OnboardingQuestion } from '@duocafe/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarPreguntas() {
      try {
        const res = await fetch(`${API_URL}/onboarding/quiz`);
        if (!res.ok) throw new Error('Error al cargar preguntas');
        const data = await res.json();
        setQuestions(data);
      } catch {
        setError('No se pudieron cargar las preguntas. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    }
    cargarPreguntas();
  }, []);

  const currentQuestion = questions[currentIndex];
  const selectedOption = currentQuestion ? answers[currentQuestion.id] ?? null : null;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelect = (optionId: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleNext = async () => {
    if (!currentQuestion || !selectedOption) return;

    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // Enviar respuestas
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const answersPayload = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const res = await fetch(`${API_URL}/onboarding/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ answers: answersPayload }),
      });

      if (!res.ok) throw new Error('Error al enviar respuestas');

      // Redirigir a primera lección disponible
      router.push('/rutas');
    } catch {
      setError('Error al enviar las respuestas. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOmitir = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      await fetch(`${API_URL}/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ daily_goal: 'casual' }),
      });

      router.push('/home');
    } catch {
      router.push('/home');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-amber-600 text-lg">Cargando quiz...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <p className="text-red-600 text-center">{error}</p>
        <Button onClick={() => router.push('/home')} variant="secondary">
          Continuar sin quiz
        </Button>
      </div>
    );
  }

  if (!questions.length) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-amber-50 px-6 py-10">
      <div className="flex-1 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-900">¿Cuánto sabes de café?</h1>
          <p className="text-amber-600 text-sm mt-1">Te ayudamos a encontrar tu nivel inicial</p>
        </div>

        {currentQuestion && (
          <QuizQuestion
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            question={currentQuestion.question}
            options={currentQuestion.options}
            selectedOption={selectedOption}
            onSelect={handleSelect}
          />
        )}
      </div>

      <div className="space-y-3 pt-8">
        <Button
          onClick={handleNext}
          disabled={!selectedOption || submitting}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
        >
          {submitting
            ? 'Enviando...'
            : isLastQuestion
            ? 'Ver mi nivel'
            : 'Siguiente'}
        </Button>
        <button
          onClick={handleOmitir}
          className="w-full text-center text-sm text-amber-600 hover:text-amber-800 py-2"
        >
          Omitir y empezar en nivel 1
        </button>
      </div>
    </div>
  );
}
