'use client';

import Link from 'next/link';
import type { LessonStatus } from '@duocafe/shared';

interface LessonNodeProps {
  lessonId: string;
  pathId: string;
  title: string;
  orderIndex: number;
  status: LessonStatus | 'locked';
  score?: number | null;
}

export function LessonNode({ lessonId, pathId, title, orderIndex, status, score }: LessonNodeProps) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';

  const nodeClass = isLocked
    ? 'bg-gray-200 border-gray-300 cursor-not-allowed'
    : isCompleted
    ? 'bg-amber-500 border-amber-600 shadow-amber-200 shadow-md'
    : isInProgress
    ? 'bg-amber-100 border-amber-400 shadow-amber-100 shadow-sm'
    : 'bg-white border-amber-300 hover:border-amber-500 hover:shadow-md';

  const icon = isLocked ? '🔒' : isCompleted ? '✅' : isInProgress ? '▶️' : '📖';

  const content = (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${nodeClass}`}>
      <div className="text-3xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium">Lección {orderIndex + 1}</p>
        <h3 className={`font-semibold truncate ${isLocked ? 'text-gray-400' : 'text-amber-900'}`}>
          {title}
        </h3>
        {isCompleted && score !== null && score !== undefined && (
          <p className="text-xs text-amber-600 mt-0.5">{score}% de precisión</p>
        )}
      </div>
    </div>
  );

  if (isLocked) {
    return <div className="opacity-60">{content}</div>;
  }

  return (
    <Link href={`/rutas/${pathId}/leccion/${lessonId}`}>
      {content}
    </Link>
  );
}
