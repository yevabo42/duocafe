'use client';

import { MAX_HEARTS } from '@duocafe/shared';

interface HeartsDisplayProps {
  heartsRemaining: number;
}

export function HeartsDisplay({ heartsRemaining }: HeartsDisplayProps) {
  return (
    <div className="flex gap-1" role="status" aria-label={`${heartsRemaining} corazones restantes`}>
      {Array.from({ length: MAX_HEARTS }).map((_, i) => (
        <span
          key={i}
          className={`text-2xl transition-all duration-300 ${
            i < heartsRemaining ? 'opacity-100 scale-100' : 'opacity-25 scale-90 grayscale'
          }`}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}
