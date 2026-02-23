import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function getPaths(accessToken: string) {
  try {
    const res = await fetch(`${API_URL}/learning/paths`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ContenidoPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'platform_admin') redirect('/admin/login');

  // Obtener token para llamar a la API (getSession es seguro aquí después de getUser)
  const { data: { session } } = await supabase.auth.getSession();
  const paths = await getPaths(session?.access_token ?? '');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de contenido</h1>
        <Link
          href="/admin/contenido/rutas/nueva"
          className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
        >
          + Nueva ruta
        </Link>
      </div>

      {paths.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-2xl border border-gray-200">
          <div className="text-5xl mb-4">📚</div>
          <p className="font-medium">No hay rutas de aprendizaje</p>
          <p className="text-sm mt-1">Crea la primera ruta para empezar</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ruta</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Lecciones</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paths.map((path: {
                id: string;
                title: string;
                order_index: number;
                is_active: boolean;
                lessons?: unknown[];
              }, i: number) => (
                <tr key={path.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{path.title}</p>
                      <p className="text-xs text-gray-400">Orden: {path.order_index}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {path.lessons?.length ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        path.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {path.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/contenido/rutas/${path.id}`}
                      className="text-amber-600 hover:text-amber-800 font-medium"
                    >
                      Editar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
