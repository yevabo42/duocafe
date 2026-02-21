'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginFormData } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const router = useRouter();
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

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setServerError('Por favor verifica tu email antes de continuar.');
      } else if (error.message.includes('Invalid login credentials')) {
        setServerError('Email o contraseña incorrectos.');
      } else {
        setServerError('Ocurrió un error. Intenta de nuevo.');
      }
      return;
    }

    router.push('/home');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-coffee-900">Bienvenido</h1>
        <p className="text-coffee-400 text-sm mt-1">Inicia sesión para continuar</p>
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="flex flex-col gap-1.5">
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Link
          href="/forgot-password"
          className="text-sm text-brand-500 hover:text-brand-600 self-end"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {serverError && (
        <p className="text-sm text-error bg-red-50 px-4 py-3 rounded-xl">{serverError}</p>
      )}

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        Iniciar sesión
      </Button>

      <p className="text-center text-sm text-coffee-500">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-brand-500 font-semibold hover:text-brand-600">
          Regístrate gratis
        </Link>
      </p>
    </form>
  );
}
