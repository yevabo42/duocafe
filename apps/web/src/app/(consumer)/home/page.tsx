import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Inicio' };

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, level, level_title, total_granos, cerezas_balance')
    .eq('id', user!.id)
    .single();

  return (
    <div className="flex flex-col gap-4 p-4 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-coffee-400 text-sm">¡Hola!</p>
          <h1 className="font-display text-2xl font-bold text-coffee-900">
            {profile?.display_name ?? 'Cafetero'}
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="flex items-center gap-1 text-amber-500">
            ☕ {profile?.total_granos ?? 0}
          </span>
          <span className="flex items-center gap-1 text-red-500">
            🍒 {profile?.cerezas_balance ?? 0}
          </span>
        </div>
      </div>

      {/* Nivel */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="text-3xl">🌱</div>
          <div className="flex-1">
            <p className="font-semibold text-coffee-900">
              Nivel {profile?.level ?? 1} · {profile?.level_title ?? 'Curioso'}
            </p>
            <div className="mt-1 h-2 bg-coffee-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: '10%' }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Reto diario placeholder */}
      <Card className="border-brand-200 bg-brand-50">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🎯</div>
          <div>
            <p className="font-semibold text-coffee-900">Reto del día</p>
            <p className="text-coffee-400 text-sm">Disponible en Sprint 2</p>
          </div>
        </div>
      </Card>

      {/* Rutas placeholder */}
      <h2 className="font-display text-lg font-bold text-coffee-900 mt-2">Continúa aprendiendo</h2>
      <p className="text-coffee-400 text-sm -mt-2">Las rutas de aprendizaje estarán disponibles en Sprint 2</p>
    </div>
  );
}
