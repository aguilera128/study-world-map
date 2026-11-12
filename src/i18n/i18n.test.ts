import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COUNTRY_MAPS, type CountryMap } from '../game/countryMaps';
import { LANGS, pathLang, preferredLang, t, VIEW_IN } from './index';

/** Todos los textos que el código pasa a `t()` o `tx()` (los literales entre comillas simples). */
function sourceTexts(): Set<string> {
  const texts = new Set<string>();
  const literal = String.raw`'((?:[^'\\]|\\.)*)'`;
  const call = new RegExp(String.raw`\bt[x]?\(\s*(?:[^'()]*\?\s*)?${literal}(?:\s*:\s*${literal})?`, 'g');
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.tsx?$/.test(entry.name) && !entry.name.includes('.test.') && !path.includes('i18n')) {
        for (const match of readFileSync(path, 'utf8').matchAll(call)) {
          for (const text of [match[1], match[2]]) if (text) texts.add(text.replace(/\\'/g, "'"));
        }
      }
    }
  };
  walk('src');
  // Textos que llegan a `t()` en una variable.
  for (const text of [
    ...['Luna nueva', 'Luna llena', 'Cuarto creciente', 'Cuarto menguante', 'Luna creciente', 'Luna menguante'],
    ...['Sin practicar', 'Aprendiendo', 'A medias', 'Casi', 'Dominado'],
    '50 países principales',
    // Los países que se estudian por dentro y sus zonas (src/game/countryMaps.ts).
    ...Object.values<CountryMap>(COUNTRY_MAPS).flatMap((map) => [map.title, ...map.zones.flatMap((zone) => zone.label ?? [])]),
  ]) {
    texts.add(text);
  }
  return texts;
}

describe('idiomas', () => {
  it('el idioma sale del primer tramo de la dirección', () => {
    expect(pathLang('/')).toBe('es');
    expect(pathLang('/en/')).toBe('en');
    expect(pathLang('/en/countries-and-capitals/')).toBe('en');
    expect(pathLang('/juego/paises-de-europa/')).toBe('es');
  });

  it('el aviso de idioma propone el primero del navegador que haya, o el inglés', () => {
    expect(preferredLang(['ca-ES', 'es-ES'])).toBe('ca');
    expect(preferredLang(['nl', 'pt-BR', 'en'])).toBe('pt');
    expect(preferredLang(['zh-Hant-TW'])).toBe('zh');
    expect(preferredLang(['ja'])).toBe('en');
    expect(preferredLang([])).toBe(null);
    expect(Object.keys(VIEW_IN).sort()).toEqual(Object.keys(LANGS).sort());
  });

  it('sin diccionario, t() devuelve el texto en español con sus variables', () => {
    expect(t('Dominas {n} de {total}', { n: 3, total: 10 })).toBe('Dominas 3 de 10');
  });

  const texts = sourceTexts();
  for (const lang of Object.keys(LANGS).filter((l) => l !== 'es')) {
    it(`el diccionario «${lang}» traduce todos los textos y conserva sus variables`, async () => {
      const dict: Record<string, string> = (await import(`./${lang}.ts`)).default;
      const missing = [...texts].filter((text) => !(text in dict));
      expect(missing, `faltan en ${lang}.ts`).toEqual([]);
      const unused = Object.keys(dict).filter((text) => !texts.has(text));
      expect(unused, `sobran en ${lang}.ts`).toEqual([]);
      const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      for (const [text, translation] of Object.entries(dict)) expect(vars(translation), text).toEqual(vars(text));
    });
  }
});
