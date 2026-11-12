import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Atlas } from '../atlas/atlas';
import type { RawAtlas } from '../atlas/types';
import { resolveScope, type GameConfig } from './config';
import { levelOf } from './population';
import { createSession, submit } from './session';

const atlas = new Atlas(JSON.parse(readFileSync('public/data/atlas.json', 'utf8')) as RawAtlas);
const play = (config: GameConfig) => createSession(atlas, config, resolveScope(atlas, config.scope, []), {}, 0, { rng: () => 0.37 });

describe('retos de población', () => {
  it('habitantes: el país preguntado es el más poblado de sus cuatro opciones, y con margen', () => {
    const session = play({ map: 'world', mode: 'inhabitants', answer: 'choice', scope: 'mundo', length: 'all' });
    expect(session.queue.length).toBeGreaterThan(100);
    for (const question of session.queue) {
      const own = atlas.countries[question.country].population!;
      const others = question.options.filter((o) => o.country !== question.country);
      expect(question.options).toHaveLength(4);
      expect(others).toHaveLength(3);
      for (const option of others) expect(atlas.countries[option.country].population! * 1.5).toBeLessThanOrEqual(own);
    }
  });

  it('población: los niveles son los de clase, por población total y no por densidad', () => {
    const level = (id: string) => levelOf(atlas.byIdOrThrow(id));
    // Baja, menos de 40 millones; media, de 40 a 100; alta, a partir de 100 (China e India incluidas).
    expect(['PRT', 'NLD', 'AUS', 'BEL'].map(level)).toEqual(['baja', 'baja', 'baja', 'baja']);
    expect(['ESP', 'FRA', 'DEU', 'ITA', 'TUR'].map(level)).toEqual(['media', 'media', 'media', 'media', 'media']);
    expect(['USA', 'BRA', 'JPN', 'NGA', 'CHN', 'IND'].map(level)).toEqual(['alta', 'alta', 'alta', 'alta', 'alta', 'alta']);
    // Los cortes entran en el nivel de arriba, y sin dato no hay nivel.
    expect(levelOf({ population: 39_999_999 })).toBe('baja');
    expect(levelOf({ population: 40_000_000 })).toBe('media');
    expect(levelOf({ population: 100_000_000 })).toBe('alta');
    expect(levelOf({ population: undefined })).toBeNull();
  });

  it('población: solo entra quien tiene dato y la respuesta buena es su nivel', () => {
    const session = play({ map: 'world', mode: 'population', answer: 'choice', scope: 'europa', length: 10 });
    const target = atlas.countries[session.queue[0].country];
    const level = levelOf(target)!;
    expect(session.pool.every((i) => levelOf(atlas.countries[i]) !== null)).toBe(true);
    expect(submit(atlas, session, { kind: 'option', id: level }, 1, () => 0.5).verdict).toBe('right');
    const wrong = level === 'alta' ? 'baja' : 'alta';
    expect(submit(atlas, session, { kind: 'option', id: wrong }, 1, () => 0.5).verdict).toBe('wrong');
  });
});
