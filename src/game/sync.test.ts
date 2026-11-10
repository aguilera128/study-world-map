import { describe, expect, it } from 'vitest';
import { mergeProgress, type Progress } from './progress';

const stats = (box: number, seen: number, last: number) => ({ box, seen, right: seen, last });

describe('mezcla de dos progresos', () => {
  it('se queda con la ficha más reciente de cada país y reto, sin perder las que solo tiene uno', () => {
    const phone: Progress = { ESP: { locate: stats(2, 3, 100), capital: stats(5, 9, 50) }, FRA: { locate: stats(4, 2, 10) } };
    const laptop: Progress = { ESP: { locate: stats(4, 5, 200), capital: stats(1, 1, 20) }, ITA: { flag: stats(3, 1, 5) } };
    const merged = mergeProgress(phone, laptop);
    expect(merged.ESP.locate).toEqual(stats(4, 5, 200));
    expect(merged.ESP.capital).toEqual(stats(5, 9, 50));
    expect(merged.FRA.locate).toEqual(stats(4, 2, 10));
    expect(merged.ITA.flag).toEqual(stats(3, 1, 5));
    // da igual el orden en que se junten
    expect(mergeProgress(laptop, phone)).toEqual(merged);
    // y no cambia los originales
    expect(phone.ESP.locate).toEqual(stats(2, 3, 100));
  });
});
