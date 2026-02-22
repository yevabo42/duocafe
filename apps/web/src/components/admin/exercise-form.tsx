'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ExerciseType } from '@duocafe/shared';

interface ExerciseFormProps {
  lessonId: string;
  onSubmit: (data: {
    lesson_id: string;
    type: ExerciseType;
    question: string;
    options: unknown;
    correct_answer: unknown;
    explanation: string;
    order_index: number;
  }) => Promise<void>;
  loading?: boolean;
}

type ChoiceOption = { id: string; text: string };

export function ExerciseForm({ lessonId, onSubmit, loading }: ExerciseFormProps) {
  const [type, setType] = useState<ExerciseType>('multiple_choice');
  const [question, setQuestion] = useState('');
  const [explanation, setExplanation] = useState('');
  const [orderIndex, setOrderIndex] = useState('0');
  const [error, setError] = useState<string | null>(null);

  // Estado para multiple_choice
  const [mcOptions, setMcOptions] = useState<ChoiceOption[]>([
    { id: 'a', text: '' },
    { id: 'b', text: '' },
    { id: 'c', text: '' },
    { id: 'd', text: '' },
  ]);
  const [mcCorrect, setMcCorrect] = useState('a');

  // Estado para true_false
  const [tfCorrect, setTfCorrect] = useState(true);

  // Estado para matching (pares izq/der)
  const [matchingPairs, setMatchingPairs] = useState([
    { id: '1', left: '', right: '' },
    { id: '2', left: '', right: '' },
  ]);

  // Estado para ordering
  const [orderingItems, setOrderingItems] = useState([
    { id: '1', text: '' },
    { id: '2', text: '' },
    { id: '3', text: '' },
  ]);

  const buildPayload = () => {
    switch (type) {
      case 'multiple_choice':
        return {
          options: mcOptions,
          correct_answer: { id: mcCorrect },
        };
      case 'true_false':
        return {
          options: [
            { id: 'true', text: 'Verdadero' },
            { id: 'false', text: 'Falso' },
          ],
          correct_answer: { value: tfCorrect },
        };
      case 'matching':
        return {
          options: matchingPairs,
          correct_answer: Object.fromEntries(
            matchingPairs.map((p) => [p.id, p.id]),
          ),
        };
      case 'ordering':
        return {
          options: orderingItems,
          correct_answer: orderingItems.map((i) => i.id),
        };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!question.trim()) {
      setError('La pregunta es requerida');
      return;
    }

    try {
      const payload = buildPayload();
      await onSubmit({
        lesson_id: lessonId,
        type,
        question: question.trim(),
        options: payload.options,
        correct_answer: payload.correct_answer,
        explanation: explanation.trim(),
        order_index: parseInt(orderIndex, 10) || 0,
      });

      // Reset form
      setQuestion('');
      setExplanation('');
      setOrderIndex('0');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tipo de ejercicio */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ExerciseType)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white"
        >
          <option value="multiple_choice">Opción múltiple</option>
          <option value="true_false">Verdadero / Falso</option>
          <option value="matching">Relacionar</option>
          <option value="ordering">Ordenar</option>
        </select>
      </div>

      {/* Pregunta */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Pregunta *</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="¿Cuál es el origen del café?"
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
          required
        />
      </div>

      {/* Opciones según tipo */}
      {type === 'multiple_choice' && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Opciones</label>
          {mcOptions.map((opt, idx) => (
            <div key={opt.id} className="flex gap-2 items-center">
              <input
                type="radio"
                name="mcCorrect"
                value={opt.id}
                checked={mcCorrect === opt.id}
                onChange={() => setMcCorrect(opt.id)}
                className="text-amber-600"
              />
              <span className="text-sm font-bold text-gray-500 w-6">{opt.id.toUpperCase()}.</span>
              <Input
                value={opt.text}
                onChange={(e) => {
                  const updated = [...mcOptions];
                  updated[idx] = { ...opt, text: e.target.value };
                  setMcOptions(updated);
                }}
                placeholder={`Opción ${opt.id.toUpperCase()}`}
                className="flex-1"
              />
            </div>
          ))}
          <p className="text-xs text-gray-400">Selecciona el radio de la respuesta correcta</p>
        </div>
      )}

      {type === 'true_false' && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Respuesta correcta</label>
          <div className="flex gap-4">
            {[true, false].map((val) => (
              <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tfCorrect"
                  checked={tfCorrect === val}
                  onChange={() => setTfCorrect(val)}
                  className="text-amber-600"
                />
                <span className="text-sm text-gray-700">{val ? 'Verdadero' : 'Falso'}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {type === 'matching' && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Pares a relacionar</label>
          {matchingPairs.map((pair, idx) => (
            <div key={pair.id} className="grid grid-cols-2 gap-2">
              <Input
                value={pair.left}
                onChange={(e) => {
                  const updated = [...matchingPairs];
                  updated[idx] = { ...pair, left: e.target.value };
                  setMatchingPairs(updated);
                }}
                placeholder="Izquierda"
              />
              <Input
                value={pair.right}
                onChange={(e) => {
                  const updated = [...matchingPairs];
                  updated[idx] = { ...pair, right: e.target.value };
                  setMatchingPairs(updated);
                }}
                placeholder="Derecha"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setMatchingPairs([...matchingPairs, { id: String(matchingPairs.length + 1), left: '', right: '' }])
            }
            className="text-sm text-amber-600 hover:text-amber-800"
          >
            + Agregar par
          </button>
        </div>
      )}

      {type === 'ordering' && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Elementos (en el orden correcto)
          </label>
          {orderingItems.map((item, idx) => (
            <div key={item.id} className="flex gap-2 items-center">
              <span className="text-sm font-bold text-gray-400 w-6">{idx + 1}.</span>
              <Input
                value={item.text}
                onChange={(e) => {
                  const updated = [...orderingItems];
                  updated[idx] = { ...item, text: e.target.value };
                  setOrderingItems(updated);
                }}
                placeholder={`Paso ${idx + 1}`}
                className="flex-1"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setOrderingItems([...orderingItems, { id: String(orderingItems.length + 1), text: '' }])
            }
            className="text-sm text-amber-600 hover:text-amber-800"
          >
            + Agregar elemento
          </button>
        </div>
      )}

      {/* Explicación */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Explicación (opcional)</label>
        <Input
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="El café tiene origen en Etiopía..."
        />
      </div>

      {/* Orden */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Orden</label>
        <Input
          type="number"
          value={orderIndex}
          onChange={(e) => setOrderIndex(e.target.value)}
          min="0"
          placeholder="0"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        {loading ? 'Guardando...' : 'Guardar ejercicio'}
      </Button>
    </form>
  );
}
