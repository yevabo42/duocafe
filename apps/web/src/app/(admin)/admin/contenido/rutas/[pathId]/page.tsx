'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PathForm } from '@/components/admin/path-form';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import type { PathWithLessons } from '@duocafe/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export default function EditarRutaPage() {
  const params = useParams();
  const router = useRouter();
  const pathId = params.pathId as string;

  const [path, setPath] = useState<PathWithLessons | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function cargar() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/admin/login'); return; }

      const res = await fetch(`${API_URL}/learning/paths/${pathId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) setPath(await res.json());
      setLoading(false);
    }
    cargar();
  }, [pathId, router]);

  const handleUpdate = async (data: {
    title: string;
    description: string;
    order_index: number;
    image_url: string;
  }) => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autorizado');

      const res = await fetch(`${API_URL}/admin/learning/paths/${pathId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Error al actualizar');
      }

      const updated = await res.json();
      setPath((prev) => prev ? { ...prev, ...updated } : updated);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Ruta no encontrada</p>
        <Link href="/admin/contenido" className="text-amber-600 hover:underline text-sm">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href="/admin/contenido" className="text-sm text-amber-600 hover:text-amber-800">
          ← Volver a contenido
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{path.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editar ruta */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Datos de la ruta</h2>
          <PathForm initial={path} onSubmit={handleUpdate} loading={saving} />
        </div>

        {/* Lista de lecciones */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Lecciones ({path.lessons.length})</h2>
            <Link
              href={`/admin/contenido/rutas/${pathId}/lecciones/nueva`}
              className="text-sm px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              + Nueva
            </Link>
          </div>

          {path.lessons.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No hay lecciones. Crea la primera.
            </p>
          ) : (
            <div className="space-y-2">
              {path.lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/admin/contenido/rutas/${pathId}/lecciones/${lesson.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{lesson.title}</p>
                    <p className="text-xs text-gray-400">
                      Orden {lesson.order_index} · {lesson.granos_reward} granos · {lesson.cerezas_reward} cerezas
                    </p>
                  </div>
                  <span className="text-amber-600 text-sm">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
