'use client';

import { LessonNode } from './lesson-node';
import type { LessonWithProgress } from '@duocafe/shared';

interface LessonMapProps {
  pathId: string;
  lessons: LessonWithProgress[];
}

export function LessonMap({ pathId, lessons }: LessonMapProps) {
  if (!lessons.length) {
    return (
      <p className="text-center text-gray-500 py-12">
        No hay lecciones disponibles en esta ruta todavía.
      </p>
    );
  }

  return (
    <div className="space-y-3 px-4">
      {lessons.map((lesson, index) => {
        const status = lesson.progress?.status ?? 'not_started';
        // Una lección está bloqueada si la anterior no se ha completado
        const previousCompleted =
          index === 0 || lessons[index - 1].progress?.status === 'completed';
        const effectiveStatus = !previousCompleted ? 'locked' : status;

        return (
          <div key={lesson.id} className="relative">
            {/* Línea vertical conectora */}
            {index < lessons.length - 1 && (
              <div className="absolute left-[28px] top-full h-3 w-0.5 bg-amber-200 z-0" />
            )}
            <LessonNode
              lessonId={lesson.id}
              pathId={pathId}
              title={lesson.title}
              orderIndex={lesson.order_index}
              status={effectiveStatus as 'locked' | 'not_started' | 'in_progress' | 'completed'}
              score={lesson.progress?.score}
            />
          </div>
        );
      })}
    </div>
  );
}
