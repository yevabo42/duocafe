'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LessonForm } from '@/components/admin/lesson-form';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export default function NuevaLeccionPage() {
  const params = useParams();
  const router = useRouter();
  const pathId = params.pathId as string;
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    path_id: string;
    title: string;
    description: string;
    order_index: number;
    granos_reward: number;
    cerezas_reward: number;
  }) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autorizado');

      const res = await fetch(`${API_URL}/admin/learning/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Error al crear lección');
      }

      const created = await res.json();
      router.push(`/admin/contenido/rutas/${pathId}/lecciones/${created.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <Link
          href={`/admin/contenido/rutas/${pathId}`}
          className="text-sm text-amber-600 hover:text-amber-800"
        >
          ← Volver a la ruta
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Nueva lección</h1>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <LessonForm pathId={pathId} onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
