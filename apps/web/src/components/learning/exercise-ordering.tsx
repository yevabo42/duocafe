'use client';

import { useState } from 'react';
import type { OrderingItem } from '@duocafe/shared';

interface ExerciseOrderingProps {
  question: string;
  items: OrderingItem[];
  answered: boolean;
  correctOrder: string[];  // array de ids en orden correcto
  onComplete: (userOrder: string[]) => void;
}

export function ExerciseOrdering({
  question,
  items,
  answered,
  correctOrder,
  onComplete,
}: ExerciseOrderingProps) {
  const [ordered, setOrdered] = useState<OrderingItem[]>(() =>
    [...items].sort(() => Math.random() - 0.5),
  );
  const [submitted, setSubmitted] = useState(false);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (answered) return;
    const newOrder = [...ordered];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setOrdered(newOrder);
  };

  const handleSubmit = () => {
    if (submitted || answered) return;
    setSubmitted(true);
    onComplete(ordered.map((item) => item.id));
  };

  const isItemCorrect = (item: OrderingItem, index: number) =>
    answered && correctOrder[index] === item.id;

  const isItemWrong = (item: OrderingItem, index: number) =>
    answered && correctOrder[index] !== item.id;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 text-center">{question}</h2>
      <p className="text-sm text-gray-500 text-center">
        Arrastra o usa las flechas para ordenar correctamente
      </p>

      <div className="space-y-2">
        {ordered.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              answered
                ? isItemCorrect(item, index)
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-400 bg-red-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <span className="text-gray-400 font-bold text-sm w-6 text-center">
              {index + 1}.
            </span>
            <span className="flex-1 text-gray-800 text-sm">{item.text}</span>

            {!answered && (
              <div className="flex gap-1">
                <button
                  onClick={() => index > 0 && moveItem(index, index - 1)}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  aria-label="Mover arriba"
                >
                  ▲
                </button>
                <button
                  onClick={() => index < ordered.length - 1 && moveItem(index, index + 1)}
                  disabled={index === ordered.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  aria-label="Mover abajo"
                >
                  ▼
                </button>
              </div>
            )}

            {answered && (
              <span>{isItemCorrect(item, index) ? '✅' : '❌'}</span>
            )}
          </div>
        ))}
      </div>

      {!answered && !submitted && (
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors"
        >
          Confirmar orden
        </button>
      )}
    </div>
  );
}
