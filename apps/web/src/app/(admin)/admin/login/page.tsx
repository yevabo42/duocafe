'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginFormData } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timeout = searchParams.get('timeout');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error || !authData.user) {
      setServerError('Credenciales incorrectas.');
      return;
    }

    // Verificar que es platform_admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (!profile || profile.role !== 'platform_admin') {
      await supabase.auth.signOut();
      setServerError('No tienes permisos de administrador.');
      return;
    }

    router.push('/admin/contenido');
  }

  return (
    <div className="min-h-screen bg-coffee-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-display text-2xl font-bold text-white">DuoCafé</span>
          <p className="text-coffee-300 text-sm mt-1">Panel de Administración</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          {timeout && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 text-amber-700 text-sm">
              Tu sesión expiró por inactividad.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <h1 className="font-display text-xl font-bold text-coffee-900">Acceso restringido</h1>

            <Input
              label="Email"
              type="email"
              placeholder="admin@duocafe.co"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <p className="text-sm text-error bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
            )}

            <Button type="submit" fullWidth loading={isSubmitting}>
              Ingresar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginContent />
    </Suspense>
  );
}
