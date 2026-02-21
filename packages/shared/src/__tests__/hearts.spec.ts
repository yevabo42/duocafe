import { MAX_HEARTS, HEART_REGEN_MINUTES, HEART_REFILL_COST_CEREZAS } from '../constants/hearts';

describe('Hearts constants', () => {
  it('MAX_HEARTS es 5 (como Duolingo)', () => {
    expect(MAX_HEARTS).toBe(5);
  });

  it('HEART_REGEN_MINUTES es positivo', () => {
    expect(HEART_REGEN_MINUTES).toBeGreaterThan(0);
  });

  it('HEART_REFILL_COST_CEREZAS es positivo', () => {
    expect(HEART_REFILL_COST_CEREZAS).toBeGreaterThan(0);
  });

  it('tiempo de regeneracion total es razonable (menos de 4 horas para 5 vidas)', () => {
    const totalMinutes = MAX_HEARTS * HEART_REGEN_MINUTES;
    expect(totalMinutes).toBeLessThanOrEqual(240); // max 4 horas
  });
});
