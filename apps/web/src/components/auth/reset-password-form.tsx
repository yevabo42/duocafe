'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ResetPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordFormData) {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password: data.password });

    if (error) {
      setServerError('No pudimos actualizar tu contraseña. El enlace puede haber expirado.');
      return;
    }

    router.push('/login?reset=success');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-coffee-900">Nueva contraseña</h1>
        <p className="text-coffee-400 text-sm mt-1">Elige una contraseña segura</p>
      </div>

      <Input
        label="Nueva contraseña"
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
        placeholder="Repite tu nueva contraseña"
        autoComplete="new-password"
        error={errors.confirm_password?.message}
        {...register('confirm_password')}
      />

      {serverError && (
        <p className="text-sm text-error bg-red-50 px-4 py-3 rounded-xl">{serverError}</p>
      )}

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        Guardar contraseña
      </Button>
    </form>
  );
}
