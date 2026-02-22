'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Slide {
  title: string;
  description: string;
  emoji: string;
}

const SLIDES: Slide[] = [
  {
    title: '¡Bienvenido a DuoCafé!',
    description: 'Aprende todo sobre el café de una manera divertida e interactiva. Gana granos y sube de nivel.',
    emoji: '☕',
  },
  {
    title: 'Aprende con lecciones',
    description: 'Completa lecciones cortas cada día y conviértete en un experto cafetero. ¡Solo 5 minutos al día!',
    emoji: '📚',
  },
  {
    title: 'Gana recompensas',
    description: 'Acumula granos y cerezas para subir de nivel y canjear premios exclusivos en tus cafeterías favoritas.',
    emoji: '🏆',
  },
];

export function WelcomeCarousel() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const isLast = currentSlide === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      router.push('/onboarding/quiz');
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-amber-50 px-6 py-12">
      {/* Mascota Cafeto placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="w-40 h-40 rounded-full bg-amber-100 flex items-center justify-center text-8xl shadow-lg">
          {slide.emoji}
        </div>

        <div className="text-center space-y-4 max-w-xs">
          <h1 className="text-2xl font-bold text-amber-900">{slide.title}</h1>
          <p className="text-amber-700 leading-relaxed">{slide.description}</p>
        </div>
      </div>

      {/* Dots indicadores */}
      <div className="flex gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all ${
              i === currentSlide
                ? 'w-6 bg-amber-600'
                : 'w-2 bg-amber-300'
            }`}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="w-full space-y-3">
        <Button onClick={handleNext} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
          {isLast ? 'Empezar quiz' : 'Siguiente'}
        </Button>
        {!isLast && (
          <button
            onClick={() => router.push('/onboarding/quiz')}
            className="w-full text-center text-sm text-amber-600 hover:text-amber-800 py-2"
          >
            Omitir
          </button>
        )}
      </div>
    </div>
  );
}
