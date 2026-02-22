'use client';

interface ExerciseTrueFalseProps {
  question: string;
  selectedOption: boolean | null;
  answered: boolean;
  correctAnswer: boolean;
  onSelect: (value: boolean) => void;
}

export function ExerciseTrueFalse({
  question,
  selectedOption,
  answered,
  correctAnswer,
  onSelect,
}: ExerciseTrueFalseProps) {
  const options = [
    { value: true, label: 'Verdadero', emoji: '✅' },
    { value: false, label: 'Falso', emoji: '❌' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-800 text-center leading-snug">
        {question}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => {
          const isSelected = selectedOption === option.value;
          const isCorrect = option.value === correctAnswer;

          let btnClass =
            'flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 transition-all duration-200 ';

          if (!answered) {
            btnClass += isSelected
              ? 'border-blue-500 bg-blue-50 scale-105 shadow-md'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50';
          } else {
            if (isCorrect) {
              btnClass += 'border-green-500 bg-green-50';
            } else if (isSelected && !isCorrect) {
              btnClass += 'border-red-500 bg-red-50';
            } else {
              btnClass += 'border-gray-200 bg-white opacity-50';
            }
          }

          return (
            <button
              key={String(option.value)}
              onClick={() => !answered && onSelect(option.value)}
              disabled={answered}
              className={btnClass}
            >
              <span className="text-4xl">{option.emoji}</span>
              <span className="font-semibold text-gray-700">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
