import { describe, expect, it } from 'vitest';
import { newListId, parseSharedList } from '../app/share';
import { modesOf } from './config';
import { MAPS } from './maps';
import { mergeProgress, record, type Progress } from './progress';
import { cleanSyncData } from './progressData';

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

describe('lo que guarda el servidor (cleanSyncData)', () => {
  const NOW = 1_800_000_000_000;
  const best = { grade: 8.5, ms: 61_000, at: NOW };

  it('guarda tal cual lo que sube la aplicación: progreso de los tres tipos de mapa, todas las marcas y el reto del día', () => {
    let progress: Progress = record({}, 'ESP', 'locate', 'first', NOW);
    progress = record(progress, 'ES-A', 'region', 'failed', NOW);
    progress = record(progress, 'lago-baikal', 'name', 'later', NOW);
    // Las claves de las marcas: `bestKey` en src/app/store.ts, con todas las zonas de todos los mapas y las listas.
    const scopes = (filters: { id: string }[]) => [...filters.map((f) => f.id), newListId(), parseSharedList('?lista=Examen~ESP.FRA')!.id];
    const bests = Object.fromEntries(
      Object.values(MAPS).flatMap((map) =>
        modesOf(map.id).flatMap((mode) =>
          mode.answers.flatMap((answer) => scopes(map.filters).flatMap((scope) => [10, 20, 'all'].map((length) => [`${mode.id}/${answer}/${scope}/${length}`, best]))),
        ),
      ),
    );
    const data = { progress, bests, daily: { date: '2026-11-14', grade: 7, streak: 3 } };
    expect(cleanSyncData(JSON.parse(JSON.stringify(data)))).toEqual(data);
  });

  it('descarta lo que no tiene la forma de un progreso', () => {
    const raw = {
      progress: { ESP: { locate: stats(3, 1, NOW), notas: 'texto' }, 'cualquier cosa': { locate: stats(3, 1, NOW) } },
      bests: { 'locate/map/europa/10': { ...best, extra: 'texto' }, 'un texto cualquiera': best, 'locate/map/europa/10/x': best, 'flag/choice/mundo/20': { grade: '9', ms: 1, at: 1 } },
      daily: { date: 'ayer', grade: 7, streak: 3 },
      otra: 'x'.repeat(1000),
    };
    expect(cleanSyncData(raw)).toEqual({ progress: { ESP: { locate: stats(3, 1, NOW) } }, bests: { 'locate/map/europa/10': best }, daily: null });
    expect(cleanSyncData('basura')).toEqual({ progress: {}, bests: {}, daily: null });
  });
});
