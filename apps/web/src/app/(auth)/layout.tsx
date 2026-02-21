export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-coffee-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <span className="text-4xl">☕</span>
            <span className="font-display text-3xl font-bold text-brand-600">DuoCafé</span>
          </div>
          <p className="mt-2 text-coffee-500 text-sm">Aprende café. Gana recompensas.</p>
        </div>

        {/* Contenido de auth */}
        <div className="bg-white rounded-3xl shadow-lg border border-coffee-100 p-7">
          {children}
        </div>
      </div>
    </div>
  );
}
