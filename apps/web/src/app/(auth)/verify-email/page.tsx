import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Verifica tu email' };

export default function VerifyEmailPage() {
  return (
    <div className="text-center flex flex-col items-center gap-4 py-4">
      <div className="text-5xl">📬</div>
      <h1 className="font-display text-2xl font-bold text-coffee-900">Verifica tu email</h1>
      <p className="text-coffee-500 text-sm">
        Hemos enviado un enlace de confirmación a tu correo. Haz clic en él para activar tu cuenta
        y comenzar a explorar DuoCafé.
      </p>
      <p className="text-coffee-400 text-xs">
        ¿No lo ves? Revisa tu carpeta de spam.
      </p>
      <Link href="/login" className="text-brand-500 font-semibold text-sm hover:text-brand-600">
        Volver al inicio de sesión
      </Link>
    </div>
  );
}
