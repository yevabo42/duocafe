import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BottomNav } from '@/components/layout/bottom-nav';

export default async function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Leer el pathname actual para no crear bucle en /onboarding
  const headersList = headers();
  const pathname = headersList.get('x-pathname') ?? '';
  const isOnboardingRoute = pathname.startsWith('/onboarding');

  if (!isOnboardingRoute) {
    // Verificar si el onboarding está completado (solo para rutas que no son de onboarding)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    if (profile && !profile.onboarding_completed) {
      redirect('/onboarding/bienvenida');
    }
  }

  // Las rutas de onboarding no muestran BottomNav
  if (isOnboardingRoute) {
    return (
      <div className="min-h-screen bg-amber-50">
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenido principal con padding para el BottomNav */}
      <main className="pb-20 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
