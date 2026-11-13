import { describe, expect, it } from 'vitest';
import { selectionWeight, type Progress, type SkillStats } from './progress';

// Repetición espaciada: cómo cambia con el tiempo el peso de un país en el sorteo de preguntas.

const NOW = Date.UTC(2026, 10, 13);
const HOUR = 3_600_000;
const DAY = 86_400_000;
const TIMES = [0, HOUR, DAY / 2, DAY, 2 * DAY, 3 * DAY, 5 * DAY, 7 * DAY, 10 * DAY, 21 * DAY, 30 * DAY, 60 * DAY, 365 * DAY, 10_000 * DAY];

const progressWith = (stats: Partial<SkillStats>): Progress => ({ ESP: { locate: { box: 3, seen: 1, right: 1, last: NOW, ...stats } } });
const weight = (box: number, ago: number, now = NOW) => selectionWeight(progressWith({ box, last: now - ago }), 'ESP', 'locate', now);

describe('repetición espaciada', () => {
  it('lo nunca visto y lo fallado pesan lo mismo que antes, pase el tiempo que pase', () => {
    for (const ago of TIMES) {
      expect(selectionWeight({}, 'ESP', 'locate', NOW + ago)).toBe(4);
      expect(weight(1, ago)).toBe(6);
    }
  });

  it('en una misma caja el peso no baja al pasar el tiempo y tiene tope', () => {
    for (const box of [2, 3, 4, 5]) {
      const weights = TIMES.map((ago) => weight(box, ago));
      for (let i = 1; i < weights.length; i++) expect(weights[i]).toBeGreaterThanOrEqual(weights[i - 1]);
      expect(Math.max(...weights)).toBeLessThanOrEqual(4);
    }
  });

  it('lo dominado y preguntado hace una hora pesa menos que lo dominado olvidado hace 60 días', () => {
    expect(weight(5, HOUR)).toBeLessThan(weight(5, 60 * DAY));
  });

  it('ninguna caja de la 2 en adelante supera a la 1 ni llega a cero', () => {
    for (const box of [2, 3, 4, 5]) {
      for (const ago of TIMES) {
        const w = weight(box, ago);
        expect(w).toBeGreaterThan(0);
        expect(w).toBeLessThanOrEqual(weight(1, ago));
      }
    }
  });

  it('una fecha en el futuro o valores raros no dan NaN ni negativos', () => {
    const odd: Partial<SkillStats>[] = [
      { box: 5, last: NOW + 30 * DAY },
      { box: 3, last: NaN },
      { box: 4, last: Infinity },
      { box: 2, last: -Infinity },
      { box: NaN, last: NOW - DAY },
      { box: 0, last: NOW - DAY },
      { box: 99, last: NOW - DAY },
      { box: 2.5, last: NOW - DAY },
    ];
    for (const stats of odd) {
      for (const now of [NOW, NaN, Infinity, 0]) {
        const w = selectionWeight(progressWith(stats), 'ESP', 'locate', now);
        expect(Number.isFinite(w)).toBe(true);
        expect(w).toBeGreaterThan(0);
      }
    }
  });
});
