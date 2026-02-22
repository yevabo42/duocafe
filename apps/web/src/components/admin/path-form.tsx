'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { LearningPath } from '@duocafe/shared';

interface PathFormProps {
  initial?: Partial<LearningPath>;
  onSubmit: (data: {
    title: string;
    description: string;
    order_index: number;
    image_url: string;
  }) => Promise<void>;
  loading?: boolean;
}

export function PathForm({ initial, onSubmit, loading }: PathFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [orderIndex, setOrderIndex] = useState(String(initial?.order_index ?? 0));
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '');
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
        title: title.trim(),
        description: description.trim(),
        order_index: parseInt(orderIndex, 10) || 0,
        image_url: imageUrl.trim(),
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
          placeholder="Orígenes del Café"
          maxLength={200}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción de la ruta de aprendizaje..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
        />
      </div>

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
        <label className="text-sm font-medium text-gray-700">URL de imagen</label>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          type="url"
          placeholder="https://..."
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        {loading ? 'Guardando...' : 'Guardar ruta'}
      </Button>
    </form>
  );
}
