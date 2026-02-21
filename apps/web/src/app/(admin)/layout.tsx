'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useInactivity } from '@/hooks/use-inactivity';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth.store';

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

  return <>{children}</>;
}
