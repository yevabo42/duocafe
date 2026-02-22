import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function getRutas(accessToken: string) {
  try {
    const res = await fetch(`${API_URL}/learning/paths`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function RutasPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const paths = await getRutas(session.access_token);

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-amber-900">Rutas de aprendizaje</h1>
        <p className="text-amber-600 text-sm mt-1">Elige por dónde quieres empezar</p>
      </div>

      {paths.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-6xl mb-4">📚</div>
          <p>No hay rutas disponibles todavía.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paths.map((path: {
            id: string;
            title: string;
            description?: string;
            image_url?: string;
            lessons?: Array<{ progress?: { status: string } }>;
          }) => {
            const totalLessons = path.lessons?.length ?? 0;
            const completedLessons =
              path.lessons?.filter((l) => l.progress?.status === 'completed').length ?? 0;
            const progressPct = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

            return (
              <Link key={path.id} href={`/rutas/${path.id}`}>
                <div className="bg-white rounded-2xl border border-amber-200 p-5 hover:border-amber-400 hover:shadow-md transition-all">
                  {path.image_url && (
                    <div className="w-full h-32 rounded-xl bg-amber-100 mb-4 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={path.image_url}
                        alt={path.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {!path.image_url && (
                    <div className="w-full h-28 rounded-xl bg-amber-100 mb-4 flex items-center justify-center text-5xl">
                      ☕
                    </div>
                  )}

                  <h2 className="font-bold text-amber-900 text-lg">{path.title}</h2>
                  {path.description && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{path.description}</p>
                  )}

                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{completedLessons}/{totalLessons} lecciones</span>
                      <span>{Math.round(progressPct)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
