'use client';

import { useState } from 'react';
import type { MatchingItem } from '@duocafe/shared';

interface ExerciseMatchingProps {
  question: string;
  items: MatchingItem[];
  answered: boolean;
  correctPairs: Record<string, string>;  // { leftId: rightId }
  onComplete: (userPairs: Record<string, string>) => void;
}

export function ExerciseMatching({
  question,
  items,
  answered,
  correctPairs,
  onComplete,
}: ExerciseMatchingProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>({});

  const leftItems = items.map((item) => ({ id: item.id, text: item.left }));
  // Mezclar los elementos del lado derecho
  const rightItems = [...items]
    .sort(() => Math.random() - 0.5)
    .map((item) => ({ id: item.id, text: item.right }));

  const handleLeftClick = (id: string) => {
    if (answered) return;
    setSelectedLeft(id === selectedLeft ? null : id);
  };

  const handleRightClick = (rightId: string) => {
    if (answered || !selectedLeft) return;

    const newPairs = { ...pairs, [selectedLeft]: rightId };
    setPairs(newPairs);
    setSelectedLeft(null);

    if (Object.keys(newPairs).length === items.length) {
      onComplete(newPairs);
    }
  };

  const isPairedLeft = (id: string) => id in pairs;
  const isPairedRight = (id: string) => Object.values(pairs).includes(id);
  const isCorrectPair = (leftId: string) =>
    answered && pairs[leftId] === correctPairs[leftId];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 text-center">{question}</h2>
      <p className="text-sm text-gray-500 text-center">
        Toca un elemento de la izquierda, luego el que corresponde a la derecha
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {leftItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLeftClick(item.id)}
              disabled={answered}
              className={`w-full px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                answered
                  ? isCorrectPair(item.id)
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-red-400 bg-red-50 text-red-800'
                  : selectedLeft === item.id
                  ? 'border-blue-500 bg-blue-50 text-blue-900 scale-105'
                  : isPairedLeft(item.id)
                  ? 'border-amber-400 bg-amber-50 text-amber-800'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
              }`}
            >
              {item.text}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {rightItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleRightClick(item.id)}
              disabled={answered || !selectedLeft}
              className={`w-full px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                answered
                  ? isCorrectPair(
                      Object.entries(pairs).find(([, v]) => v === item.id)?.[0] ?? '',
                    )
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-red-400 bg-red-50 text-red-800'
                  : isPairedRight(item.id)
                  ? 'border-amber-400 bg-amber-50 text-amber-800'
                  : selectedLeft
                  ? 'border-gray-300 bg-white text-gray-800 hover:border-blue-300 hover:bg-blue-50'
                  : 'border-gray-200 bg-white text-gray-500 opacity-60'
              }`}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
