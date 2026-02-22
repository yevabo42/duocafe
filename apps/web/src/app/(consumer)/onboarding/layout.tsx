// El consumer layout detecta las rutas /onboarding y renderiza sin BottomNav.
// Este layout anidado solo pasa los children sin modificaciones adicionales.
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
