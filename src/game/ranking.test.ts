import { describe, expect, it } from 'vitest';
import { SAMPLE_LIST, type GameConfig } from './config';
import { MAPS } from './maps';
import { categoryOf, cleanNick, compare, dailyCategory, isCategory, plausible, qualifies, RANKED, suggestNick, TOP } from './ranking';

describe('categorías', () => {
  it('lo que se clasifica coincide con los retos y las zonas de cada mapa', () => {
    for (const map of Object.values(MAPS)) {
      expect(RANKED[map.id].modes).toEqual(map.modes);
      const scopes = map.filters.map((f) => f.id);
      expect(RANKED[map.id].scopes).toEqual(map.id === 'world' ? [...scopes, SAMPLE_LIST.id] : scopes);
    }
  });

  it('una partida de una zona de serie tiene categoría; una lista propia, no', () => {
    const config: GameConfig = { map: 'world', mode: 'locate', answer: 'map', scope: 'europa', length: 10 };
    expect(categoryOf(config)).toBe('world/locate/map/europa/10');
    expect(categoryOf({ ...config, length: 'all' })).toBe('world/locate/map/europa/all');
    expect(categoryOf({ ...config, scope: 'lista-abc123' })).toBeNull();
    // Un reto que no existe en ese mapa.
    expect(categoryOf({ ...config, map: 'es', scope: 'es' })).toBe('es/locate/map/es/10');
    expect(categoryOf({ ...config, map: 'es', mode: 'flag', scope: 'es' })).toBeNull();
  });

  it('solo valen las categorías que existen', () => {
    expect(isCategory('world/locate/map/europa/10')).toBe(true);
    expect(isCategory('world/locate/map/europa/15')).toBe(false);
    expect(isCategory('world/locate/map/europa')).toBe(false);
    expect(isCategory('constructor/locate/map/europa/10')).toBe(false);
    expect(isCategory('')).toBe(false);
  });

  it('el reto del día vale con la fecha de estos días', () => {
    const now = Date.parse('2026-11-11T18:00:00Z');
    expect(isCategory(dailyCategory('2026-11-11'), now)).toBe(true);
    expect(isCategory(dailyCategory('2026-11-12'), now)).toBe(true);
    expect(isCategory(dailyCategory('2026-11-20'), now)).toBe(false);
    expect(isCategory('dia/hoy', now)).toBe(false);
  });
});

describe('resultados', () => {
  it('acepta lo que puede salir de una partida y rechaza lo imposible', () => {
    expect(plausible({ grade: 9.5, ms: 68_000, total: 10 })).toBe(true);
    expect(plausible({ grade: 10, ms: 6_000, total: 10 })).toBe(true);
    expect(plausible({ grade: 9.3, ms: 68_000, total: 10 })).toBe(false); // no sale de medios puntos
    expect(plausible({ grade: 10, ms: 3_000, total: 10 })).toBe(false); // demasiado rápido
    expect(plausible({ grade: 11, ms: 68_000, total: 10 })).toBe(false);
    expect(plausible({ grade: 10, ms: 68_000.5, total: 10 })).toBe(false);
    expect(plausible({ grade: 10, ms: 68_000, total: 0 })).toBe(false);
    expect(plausible({ grade: Number.NaN, ms: 68_000, total: 10 })).toBe(false);
    // 197 países: (150 + 20 · 0,5) / 197 · 10
    expect(plausible({ grade: (160 / 197) * 10, ms: 900_000, total: 197 })).toBe(true);
  });

  it('ordena por nota y, a igual nota, por tiempo', () => {
    const rows = [
      { grade: 9, ms: 30_000 },
      { grade: 10, ms: 90_000 },
      { grade: 10, ms: 40_000 },
    ];
    expect([...rows].sort(compare)).toEqual([rows[2], rows[1], rows[0]]);
  });

  it('entra si hay hueco o si mejora al último', () => {
    const full = Array.from({ length: TOP }, (_, i) => ({ grade: 10 - i * 0.5, ms: 60_000 }));
    expect(qualifies({ grade: 5, ms: 1 }, full.slice(0, 3))).toBe(true);
    expect(qualifies({ grade: 4.5, ms: 1 }, [])).toBe(false); // un suspenso no se publica
    expect(qualifies({ grade: 5.5, ms: 70_000 }, full)).toBe(false);
    expect(qualifies({ grade: 5.5, ms: 50_000 }, full)).toBe(true);
    expect(qualifies({ grade: 6, ms: 999_000 }, full)).toBe(true);
  });
});

describe('apodos', () => {
  it('limpia los espacios y acepta letras de cualquier alfabeto', () => {
    expect(cleanNick('  Lince   veloz ')).toBe('Lince veloz');
    expect(cleanNick('Ñandú_7')).toBe('Ñandú_7');
    expect(cleanNick('小明')).toBe('小明');
  });

  it('rechaza lo que no es un apodo', () => {
    for (const bad of ['a', 'x'.repeat(17), 'ana@correo.es', 'www.algo.com', '666123456', '12', 'Ana 612345', '<b>hola</b>', '', null, 42]) {
      expect(cleanNick(bad), String(bad)).toBeNull();
    }
  });

  it('veta los insultos sin vetar palabras que los contienen', () => {
    for (const bad of ['Puta vida', 'el CABRÓN', 'xX_fuck_Xx', 'gilipollas99']) expect(cleanNick(bad), bad).toBeNull();
    for (const fine of ['Computadora', 'Disputa 7', 'Pollo frito']) expect(cleanNick(fine), fine).toBe(fine);
  });

  it('el apodo sugerido siempre vale', () => {
    for (let i = 0; i < 200; i++) {
      const nick = suggestNick();
      expect(cleanNick(nick), nick).toBe(nick);
    }
  });
});
