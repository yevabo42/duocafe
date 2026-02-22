'use client';

interface Option {
  id: string;
  text: string;
}

interface QuizQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: Option[];
  selectedOption: string | null;
  onSelect: (optionId: string) => void;
}

export function QuizQuestion({
  questionNumber,
  totalQuestions,
  question,
  options,
  selectedOption,
  onSelect,
}: QuizQuestionProps) {
  return (
    <div className="space-y-6">
      {/* Progreso */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-amber-700">
          <span>Pregunta {questionNumber} de {totalQuestions}</span>
          <span>{Math.round((questionNumber / totalQuestions) * 100)}%</span>
        </div>
        <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-600 rounded-full transition-all duration-500"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Pregunta */}
      <h2 className="text-xl font-semibold text-amber-900 text-center leading-snug">
        {question}
      </h2>

      {/* Opciones */}
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-amber-600 bg-amber-100 text-amber-900 font-medium scale-[1.02]'
                  : 'border-amber-200 bg-white text-amber-800 hover:border-amber-400 hover:bg-amber-50'
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-amber-300 text-amber-500'
                  }`}
                >
                  {option.id.toUpperCase()}
                </span>
                {option.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
