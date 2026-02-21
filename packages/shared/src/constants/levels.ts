import type { Level } from '../types/gamification.types';

/**
 * Tabla de niveles de DuoCafe
 * granos_required = Granos (XP) necesarios para ALCANZAR este nivel
 */
export const LEVELS: Level[] = [
  { level: 1, name: 'Curioso',          granos_required: 0,       granos_next: 500 },
  { level: 2, name: 'Catador Novato',   granos_required: 500,     granos_next: 2000 },
  { level: 3, name: 'Barista en Casa',  granos_required: 2000,    granos_next: 5000 },
  { level: 4, name: 'Conocedor',        granos_required: 5000,    granos_next: 12000 },
  { level: 5, name: 'Sommelier del Cafe', granos_required: 12000, granos_next: 25000 },
  { level: 6, name: 'Maestro Tostador', granos_required: 25000,   granos_next: 50000 },
  { level: 7, name: 'Caficultor Experto', granos_required: 50000, granos_next: 100000 },
  { level: 8, name: 'Leyenda del Cafe', granos_required: 100000,  granos_next: null },
];

/**
 * Calcular nivel basado en granos totales
 */
export function getLevelFromGranos(totalGranos: number): Level {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (totalGranos >= level.granos_required) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
}

/**
 * Progreso hacia el siguiente nivel (0-100)
 */
export function getLevelProgress(totalGranos: number): number {
  const current = getLevelFromGranos(totalGranos);
  if (current.granos_next === null) return 100; // nivel maximo
  const range = current.granos_next - current.granos_required;
  const progress = totalGranos - current.granos_required;
  return Math.min(100, Math.round((progress / range) * 100));
}
