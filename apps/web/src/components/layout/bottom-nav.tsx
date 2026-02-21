'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { href: '/home', icon: '🏠', label: 'Inicio' },
  { href: '/rutas', icon: '📚', label: 'Rutas' },
  { href: '/logros', icon: '🏆', label: 'Logros' },
  { href: '/tienda', icon: '🛒', label: 'Tienda' },
  { href: '/perfil', icon: '👤', label: 'Perfil' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-coffee-100 safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center gap-0.5 flex-1 py-2 transition-colors',
                active ? 'text-brand-500' : 'text-coffee-300 hover:text-coffee-500',
              )}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className={clsx('text-xs', active && 'font-semibold')}>{item.label}</span>
              {active && (
                <span className="absolute bottom-0 w-6 h-0.5 bg-brand-500 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
