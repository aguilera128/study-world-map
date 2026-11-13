import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Atlas } from '../atlas/atlas';
import type { RawAtlas } from '../atlas/types';
import type { GameConfig } from './config';
import { levelOf } from './population';
import { isRightOption, type Question } from './session';

const atlas = new Atlas(JSON.parse(readFileSync('public/data/atlas.json', 'utf8')) as RawAtlas);
const spain = atlas.byIdOrThrow('ESP');
const france = atlas.byIdOrThrow('FRA');
const question: Question = { country: atlas.countries.indexOf(spain), review: false, options: [] };
const config = (mode: GameConfig['mode']): GameConfig => ({ map: 'world', mode, answer: 'choice', scope: 'mundo', length: 'all' });

describe('isRightOption', () => {
  it('por defecto vale la opción del país preguntado y no la de otro', () => {
    const own = { id: spain.id, label: '', country: question.country };
    const other = { id: france.id, label: '', country: atlas.countries.indexOf(france) };
    expect(isRightOption(config('capital'), spain, question, own)).toBe(true);
    expect(isRightOption(config('capital'), spain, question, other)).toBe(false);
  });

  it('continente: vale la clave del continente del país', () => {
    const option = (id: string) => ({ id, label: '', country: -1 });
    expect(isRightOption(config('continent'), spain, question, option(spain.continents[0]))).toBe(true);
    expect(isRightOption(config('continent'), spain, question, option('oceania'))).toBe(false);
  });

  it('población: vale el nivel del país', () => {
    const option = (id: string) => ({ id, label: '', country: -1 });
    expect(isRightOption(config('population'), spain, question, option(levelOf(spain)!))).toBe(true);
    expect(isRightOption(config('population'), spain, question, option('alta'))).toBe(false);
  });
});
