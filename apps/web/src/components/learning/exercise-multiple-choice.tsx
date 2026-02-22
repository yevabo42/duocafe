'use client';

import type { MultipleChoiceOption } from '@duocafe/shared';

interface ExerciseMultipleChoiceProps {
  question: string;
  options: MultipleChoiceOption[];
  selectedOption: string | null;
  answered: boolean;
  correctAnswer: string;
  onSelect: (optionId: string) => void;
}

export function ExerciseMultipleChoice({
  question,
  options,
  selectedOption,
  answered,
  correctAnswer,
  onSelect,
}: ExerciseMultipleChoiceProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 text-center leading-snug">
        {question}
      </h2>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.id === correctAnswer;

          let buttonClass =
            'w-full text-left px-4 py-4 rounded-xl border-2 transition-all duration-200 ';

          if (!answered) {
            buttonClass += isSelected
              ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium scale-[1.01]'
              : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50';
          } else {
            if (isCorrect) {
              buttonClass += 'border-green-500 bg-green-50 text-green-900 font-medium';
            } else if (isSelected && !isCorrect) {
              buttonClass += 'border-red-500 bg-red-50 text-red-900';
            } else {
              buttonClass += 'border-gray-200 bg-white text-gray-500 opacity-60';
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => !answered && onSelect(option.id)}
              disabled={answered}
              className={buttonClass}
            >
              <span className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 uppercase w-5">
                  {option.id}.
                </span>
                {option.text}
                {answered && isCorrect && <span className="ml-auto">✅</span>}
                {answered && isSelected && !isCorrect && <span className="ml-auto">❌</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
