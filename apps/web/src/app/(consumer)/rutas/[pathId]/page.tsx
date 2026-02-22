import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LessonMap } from '@/components/learning/lesson-map';
import Link from 'next/link';
import type { PathWithLessons } from '@duocafe/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function getPath(pathId: string, accessToken: string): Promise<PathWithLessons | null> {
  try {
    const res = await fetch(`${API_URL}/learning/paths/${pathId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

interface Props {
  params: { pathId: string };
}

export default async function PathDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const path = await getPath(params.pathId, session.access_token);

  if (!path) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-5xl">😕</div>
        <p className="text-gray-600">Ruta no encontrada</p>
        <Link href="/rutas" className="text-amber-600 hover:underline">
          Volver a rutas
        </Link>
      </div>
    );
  }

  const totalLessons = path.lessons.length;
  const completedLessons = path.lessons.filter(
    (l) => l.progress?.status === 'completed',
  ).length;

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="px-4 space-y-3">
        <Link href="/rutas" className="text-sm text-amber-600 hover:text-amber-800 flex items-center gap-1">
          ← Volver a rutas
        </Link>
        <h1 className="text-2xl font-bold text-amber-900">{path.title}</h1>
        {path.description && (
          <p className="text-gray-600 text-sm">{path.description}</p>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{completedLessons}/{totalLessons} lecciones completadas</span>
        </div>

        {/* Barra de progreso de la ruta */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{
              width: totalLessons > 0
                ? `${(completedLessons / totalLessons) * 100}%`
                : '0%',
            }}
          />
        </div>
      </div>

      {/* Mapa de lecciones */}
      <LessonMap pathId={path.id} lessons={path.lessons} />
    </div>
  );
}
