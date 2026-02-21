import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Dashboard Admin | DuoCafé' };

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'platform_admin') {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-coffee-900 mb-2">
          Panel de Administración
        </h1>
        <p className="text-coffee-400 mb-8">Bienvenido, {profile.display_name}</p>

        {/* Placeholder para Sprint 2+ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Usuarios', value: '—', icon: '👥' },
            { label: 'Marcas activas', value: '—', icon: '🏪' },
            { label: 'Granos distribuidos', value: '—', icon: '☕' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-coffee-100">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="font-display text-2xl font-bold text-coffee-900">{stat.value}</div>
              <div className="text-coffee-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-coffee-300 text-sm">
          Dashboard completo disponible en Sprint 2
        </p>
      </div>
    </div>
  );
}
