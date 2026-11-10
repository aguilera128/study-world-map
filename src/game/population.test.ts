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

  it('densidad: solo entra quien tiene dato y la respuesta buena es su nivel', () => {
    const session = play({ map: 'world', mode: 'population', answer: 'choice', scope: 'europa', length: 10 });
    const target = atlas.countries[session.queue[0].country];
    const level = levelOf(target)!;
    expect(session.pool.every((i) => levelOf(atlas.countries[i]) !== null)).toBe(true);
    expect(submit(atlas, session, { kind: 'option', id: level }, 1, () => 0.5).verdict).toBe('right');
    const wrong = level === 'alta' ? 'baja' : 'alta';
    expect(submit(atlas, session, { kind: 'option', id: wrong }, 1, () => 0.5).verdict).toBe('wrong');
  });
});
