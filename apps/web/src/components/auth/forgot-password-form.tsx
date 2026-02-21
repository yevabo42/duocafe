'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    const supabase = createClient();
    // Siempre mostrar éxito (no revelar si el email existe)
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center flex flex-col items-center gap-4 py-4">
        <div className="text-5xl">✉️</div>
        <h2 className="font-display text-xl font-bold text-coffee-900">Email enviado</h2>
        <p className="text-coffee-500 text-sm">
          Si tu email está registrado, recibirás las instrucciones para restablecer tu contraseña.
        </p>
        <Link href="/login" className="text-brand-500 font-semibold text-sm hover:text-brand-600">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-coffee-900">Recuperar contraseña</h1>
        <p className="text-coffee-400 text-sm mt-1">
          Ingresa tu email y te enviaremos las instrucciones
        </p>
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        Enviar instrucciones
      </Button>

      <Link
        href="/login"
        className="text-center text-sm text-brand-500 hover:text-brand-600 font-medium"
      >
        ← Volver al inicio de sesión
      </Link>
    </form>
  );
}
