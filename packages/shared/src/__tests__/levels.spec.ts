import { getLevelFromGranos, getLevelProgress, LEVELS } from '../constants/levels';

describe('getLevelFromGranos', () => {
  it('retorna nivel 1 para 0 granos', () => {
    expect(getLevelFromGranos(0).level).toBe(1);
  });

  it('retorna nivel 1 para granos dentro del primer rango', () => {
    expect(getLevelFromGranos(50).level).toBe(1);
    expect(getLevelFromGranos(99).level).toBe(1);
  });

  it('retorna nivel 2 al cruzar el umbral', () => {
    const threshold = LEVELS[1].granos_required;
    expect(getLevelFromGranos(threshold).level).toBe(2);
  });

  it('retorna nivel 8 (Leyenda) para granos maximos', () => {
    const maxLevel = LEVELS[LEVELS.length - 1];
    expect(getLevelFromGranos(maxLevel.granos_required).level).toBe(8);
    expect(getLevelFromGranos(999999).level).toBe(8);
  });

  it('retorna el nombre correcto para cada nivel', () => {
    expect(getLevelFromGranos(0).name).toBe('Curioso');
    expect(getLevelFromGranos(999999).name).toBe('Leyenda del Cafe');
  });

  it('los umbrales son ascendentes (invariante de la tabla)', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].granos_required).toBeGreaterThan(LEVELS[i - 1].granos_required);
    }
  });
});

describe('getLevelProgress', () => {
  it('retorna 0% al inicio de un nivel', () => {
    const level2Start = LEVELS[1].granos_required;
    const result = getLevelProgress(level2Start);
    expect(result).toBe(0);
  });

  it('retorna 100% en el ultimo nivel (no hay siguiente)', () => {
    const lastLevelStart = LEVELS[LEVELS.length - 1].granos_required;
    const result = getLevelProgress(lastLevelStart + 1000);
    expect(result).toBe(100);
  });

  it('retorna porcentaje entre 0 y 100 en niveles intermedios', () => {
    const level = LEVELS[2];
    const midPoint = level.granos_required + Math.floor((LEVELS[3].granos_required - level.granos_required) / 2);
    const result = getLevelProgress(midPoint);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(100);
  });

  it('los granos en nivel 1 retornan progreso no negativo', () => {
    const result = getLevelProgress(0);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});
