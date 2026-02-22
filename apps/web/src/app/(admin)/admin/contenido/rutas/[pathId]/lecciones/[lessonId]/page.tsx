'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LessonForm } from '@/components/admin/lesson-form';
import { ExerciseForm } from '@/components/admin/exercise-form';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import type { Exercise, LessonWithExercises } from '@duocafe/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export default function EditarLeccionPage() {
  const params = useParams();
  const router = useRouter();
  const pathId = params.pathId as string;
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<LessonWithExercises | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingExercise, setAddingExercise] = useState(false);

  useEffect(() => {
    async function cargar() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/admin/login'); return; }

      const res = await fetch(`${API_URL}/learning/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) setLesson(await res.json());
      setLoading(false);
    }
    cargar();
  }, [lessonId, router]);

  const handleUpdateLesson = async (data: {
    path_id: string;
    title: string;
    description: string;
    order_index: number;
    granos_reward: number;
    cerezas_reward: number;
  }) => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autorizado');

      const { path_id: _, ...lessonData } = data;
      const res = await fetch(`${API_URL}/admin/learning/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(lessonData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Error al actualizar lección');
      }

      const updated = await res.json();
      setLesson((prev) => prev ? { ...prev, ...updated } : null);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExercise = async (data: {
    lesson_id: string;
    type: string;
    question: string;
    options: unknown;
    correct_answer: unknown;
    explanation: string;
    order_index: number;
  }) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No autorizado');

    const res = await fetch(`${API_URL}/admin/learning/exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? 'Error al crear ejercicio');
    }

    const created = await res.json();
    setLesson((prev) =>
      prev ? { ...prev, exercises: [...prev.exercises, created as Exercise] } : null,
    );
    setAddingExercise(false);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!confirm('¿Eliminar este ejercicio?')) return;

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch(`${API_URL}/admin/learning/exercises/${exerciseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    setLesson((prev) =>
      prev
        ? { ...prev, exercises: prev.exercises.filter((e) => e.id !== exerciseId) }
        : null,
    );
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Cargando...</div>;
  }

  if (!lesson) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Lección no encontrada</p>
        <Link href={`/admin/contenido/rutas/${pathId}`} className="text-amber-600 text-sm hover:underline">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link
          href={`/admin/contenido/rutas/${pathId}`}
          className="text-sm text-amber-600 hover:text-amber-800"
        >
          ← Volver a la ruta
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{lesson.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editar lección */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Datos de la lección</h2>
          <LessonForm pathId={pathId} initial={lesson} onSubmit={handleUpdateLesson} loading={saving} />
        </div>

        {/* Ejercicios */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">
              Ejercicios ({lesson.exercises.length})
            </h2>
            <button
              onClick={() => setAddingExercise(!addingExercise)}
              className="text-sm px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              {addingExercise ? '✕ Cancelar' : '+ Nuevo'}
            </button>
          </div>

          {addingExercise && (
            <div className="border border-amber-200 rounded-xl p-4 bg-amber-50">
              <h3 className="text-sm font-semibold text-amber-900 mb-3">Nuevo ejercicio</h3>
              <ExerciseForm lessonId={lessonId} onSubmit={handleCreateExercise} />
            </div>
          )}

          {lesson.exercises.length === 0 && !addingExercise ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No hay ejercicios. Crea el primero.
            </p>
          ) : (
            <div className="space-y-2">
              {lesson.exercises.map((exercise, i) => (
                <div
                  key={exercise.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-200"
                >
                  <span className="text-xs font-bold text-gray-400 mt-1">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {exercise.question}
                    </p>
                    <span className="text-xs text-amber-600 capitalize">{exercise.type.replace('_', ' ')}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="text-red-400 hover:text-red-600 text-sm shrink-0"
                    aria-label="Eliminar ejercicio"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
