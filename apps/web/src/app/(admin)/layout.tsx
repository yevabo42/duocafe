'use client';

import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useInactivity } from '@/hooks/use-inactivity';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth.store';

function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // No mostrar nav en la página de login
  if (pathname === '/admin/login') return null;

  return (
    <nav className="bg-coffee-900 text-white px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <span className="font-display font-bold text-lg">DuoCafé Admin</span>
        <Link
          href="/admin/contenido"
          className={`text-sm transition-colors ${
            pathname.startsWith('/admin/contenido')
              ? 'text-amber-400 font-medium'
              : 'text-coffee-300 hover:text-white'
          }`}
        >
          Contenido
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-coffee-300 hover:text-white transition-colors"
      >
        Cerrar sesión
      </button>
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  const handleTimeout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearAuth();
    router.push('/admin/login?timeout=true');
  }, [router, clearAuth]);

  // Activo solo para usuarios admin autenticados (no en /admin/login)
  useInactivity(handleTimeout, !!user && user.role === 'platform_admin');

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <main>{children}</main>
    </div>
  );
}
