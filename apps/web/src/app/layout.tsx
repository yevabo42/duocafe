import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'DuoCafé',
    template: '%s | DuoCafé',
  },
  description: 'Aprende sobre café y gana recompensas con las mejores marcas colombianas',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DuoCafé',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#d97218',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
