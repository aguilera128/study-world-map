import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Atlas } from '../atlas/atlas';
import type { RawAtlas } from '../atlas/types';
import { resolveScope } from './config';
import { currentStreak, dailyConfig, dailyKey, dailyRng, recordDaily } from './daily';
import { createSession } from './session';

const atlas = new Atlas(JSON.parse(readFileSync('public/data/atlas.json', 'utf8')) as RawAtlas);

const questions = (key: string) => {
  const config = dailyConfig(key);
  return createSession(atlas, config, resolveScope(atlas, config.scope, []), {}, 0, { rng: dailyRng(key) }).queue.map((q) => q.country);
};

describe('reto del día', () => {
  it('la fecha sale en hora local, con ceros', () => {
    expect(dailyKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('el mismo día da las mismas diez preguntas, y otro día, otras', () => {
    expect(questions('2026-11-10')).toEqual(questions('2026-11-10'));
    expect(questions('2026-11-10')).toHaveLength(10);
    expect(questions('2026-11-11')).not.toEqual(questions('2026-11-10'));
  });

  it('los retos se turnan de un día para otro', () => {
    const week = ['10', '11', '12', '13', '14', '15'].map((d) => dailyConfig(`2026-11-${d}`).mode);
    expect(new Set(week).size).toBe(6);
  });

  it('la racha sube jugando días seguidos, no al repetir el mismo día, y se rompe al saltarse uno', () => {
    let record = recordDaily(null, '2026-11-10', 7);
    expect(record.streak).toBe(1);
    record = recordDaily(record, '2026-11-10', 10);
    expect(record).toEqual({ date: '2026-11-10', grade: 7, streak: 1 });
    record = recordDaily(record, '2026-11-11', 8);
    expect(record.streak).toBe(2);
    // cambio de mes
    record = recordDaily({ date: '2026-11-30', grade: 5, streak: 4 }, '2026-12-01', 6);
    expect(record.streak).toBe(5);
    expect(recordDaily(record, '2026-12-03', 6).streak).toBe(1);
    expect(currentStreak(record, '2026-12-02')).toBe(5);
    expect(currentStreak(record, '2026-12-03')).toBe(0);
  });
});
