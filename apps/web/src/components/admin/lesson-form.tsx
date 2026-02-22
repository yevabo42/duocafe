'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Lesson } from '@duocafe/shared';

interface LessonFormProps {
  pathId: string;
  initial?: Partial<Lesson>;
  onSubmit: (data: {
    path_id: string;
    title: string;
    description: string;
    order_index: number;
    granos_reward: number;
    cerezas_reward: number;
  }) => Promise<void>;
  loading?: boolean;
}

export function LessonForm({ pathId, initial, onSubmit, loading }: LessonFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [orderIndex, setOrderIndex] = useState(String(initial?.order_index ?? 0));
  const [granosReward, setGranosReward] = useState(String(initial?.granos_reward ?? 10));
  const [cerezasReward, setCerezasReward] = useState(String(initial?.cerezas_reward ?? 5));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }

    try {
      await onSubmit({
        path_id: pathId,
        title: title.trim(),
        description: description.trim(),
        order_index: parseInt(orderIndex, 10) || 0,
        granos_reward: parseInt(granosReward, 10) || 10,
        cerezas_reward: parseInt(cerezasReward, 10) || 5,
      });
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

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Título *</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿De dónde viene el café?"
          maxLength={200}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción de la lección..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
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
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Granos ☕</label>
          <Input
            type="number"
            value={granosReward}
            onChange={(e) => setGranosReward(e.target.value)}
            min="0"
            placeholder="10"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Cerezas 🍒</label>
          <Input
            type="number"
            value={cerezasReward}
            onChange={(e) => setCerezasReward(e.target.value)}
            min="0"
            placeholder="5"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        {loading ? 'Guardando...' : 'Guardar lección'}
      </Button>
    </form>
  );
}
