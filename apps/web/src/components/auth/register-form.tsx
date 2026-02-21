'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { registerSchema, type RegisterFormData } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function RegisterForm() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.display_name,
          referral_code: data.referral_code || undefined,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        setServerError('Este email ya está registrado. ¿Quieres iniciar sesión?');
      } else {
        setServerError('No pudimos crear tu cuenta. Intenta de nuevo.');
      }
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="text-center flex flex-col items-center gap-4 py-4">
        <div className="text-5xl">📧</div>
        <h2 className="font-display text-xl font-bold text-coffee-900">¡Revisa tu email!</h2>
        <p className="text-coffee-500 text-sm">
          Te enviamos un enlace de confirmación. Haz clic en él para activar tu cuenta.
        </p>
        <Link href="/login" className="text-brand-500 font-semibold text-sm hover:text-brand-600">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-coffee-900">Crea tu cuenta</h1>
        <p className="text-coffee-400 text-sm mt-1">Únete al ecosistema DuoCafé</p>
      </div>

      <Input
        label="Tu nombre"
        type="text"
        placeholder="¿Cómo te llamamos?"
        autoComplete="name"
        error={errors.display_name?.message}
        {...register('display_name')}
      />

      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="Mínimo 8 caracteres"
        autoComplete="new-password"
        hint="Debe tener mayúscula y número"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirmar contraseña"
        type="password"
        placeholder="Repite tu contraseña"
        autoComplete="new-password"
        error={errors.confirm_password?.message}
        {...register('confirm_password')}
      />

      <Input
        label="Código de referido (opcional)"
        type="text"
        placeholder="ABC12345"
        hint="¿Alguien te invitó? Ingresa su código"
        error={errors.referral_code?.message}
        {...register('referral_code')}
      />

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-coffee-300 text-brand-500 focus:ring-brand-500"
          {...register('terms_accepted')}
        />
        <span className="text-sm text-coffee-500">
          Acepto los{' '}
          <Link href="/terminos" className="text-brand-500 hover:underline">
            términos y condiciones
          </Link>
        </span>
      </label>
      {errors.terms_accepted && (
        <p className="text-sm text-error -mt-2">{errors.terms_accepted.message}</p>
      )}

      {serverError && (
        <p className="text-sm text-error bg-red-50 px-4 py-3 rounded-xl">{serverError}</p>
      )}

      <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-1">
        Crear cuenta
      </Button>

      <p className="text-center text-sm text-coffee-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-brand-500 font-semibold hover:text-brand-600">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
