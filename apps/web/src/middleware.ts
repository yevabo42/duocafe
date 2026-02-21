import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Rutas que requieren autenticacion
const PROTECTED_CONSUMER_PATHS = ['/home', '/rutas', '/logros', '/perfil', '/tienda'];
const PROTECTED_ADMIN_PATHS = ['/admin/dashboard', '/admin/usuarios', '/admin/configuracion'];

// Rutas solo para no-autenticados
const AUTH_PATHS = ['/login', '/register', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Rutas del admin
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // Verificar rol admin (el perfil se valida en el layout, aquí solo auth)
    return supabaseResponse;
  }

  // Rutas protegidas de consumidor
  const isProtectedConsumer = PROTECTED_CONSUMER_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  if (isProtectedConsumer && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Rutas de auth: redirigir si ya está logueado
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-.*\\.js).*)',
  ],
};
