import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Atlas } from './atlas';
import { buildMesh, CELL, clipRing } from './mesh';
import type { RawAtlas } from './types';

// Estas pruebas trabajan sobre el atlas generado: ejecuta antes `pnpm atlas` (o `pnpm dev`).
const raw = JSON.parse(readFileSync('public/data/atlas.json', 'utf8')) as RawAtlas;
const atlas = new Atlas(raw);
const idAt = (lon: number, lat: number) => {
  const i = atlas.locate(lon, lat);
  return i < 0 ? null : atlas.countries[i].id;
};

describe('atlas', () => {
  it('tiene los 197 países del cuestionario, todos con capital, región, continente y bandera', () => {
    expect(atlas.quizzable).toHaveLength(197);
    for (const i of atlas.quizzable) {
      const c = atlas.countries[i];
      expect(c.capital, c.id).toBeTruthy();
      expect(c.regions.length, c.id).toBeGreaterThan(0);
      expect(c.continents.length, c.id).toBeGreaterThan(0);
      for (const k of c.continents) expect(atlas.continents[k], c.id).toBeTruthy();
      expect(c.a2, c.id).toMatch(/^[a-z]{2}$/);
      expect(c.polygons.length, c.id).toBeGreaterThan(0);
    }
  });

  it('no repite nombres ni capitales ambiguas entre países', () => {
    const names = atlas.quizzable.map((i) => atlas.countries[i].name);
    expect(new Set(names).size).toBe(names.length);
    const capitals = atlas.quizzable.map((i) => atlas.countries[i].capital);
    expect(new Set(capitals).size).toBe(capitals.length);
  });

  it('localiza el país de un punto', () => {
    expect(idAt(-3.7, 40.4)).toBe('ESP'); // Madrid
    expect(idAt(2.35, 48.86)).toBe('FRA'); // París
    expect(idAt(-52.33, 4.93)).toBe('FRA'); // Cayena (Guayana Francesa)
    expect(idAt(37.62, 55.75)).toBe('RUS'); // Moscú
    expect(idAt(20.5, 54.7)).toBe('RUS'); // Kaliningrado
    expect(idAt(-157.86, 21.31)).toBe('USA'); // Honolulu
    expect(idAt(-42, 72)).toBe('GRL'); // interior de Groenlandia
    expect(idAt(-30, 40)).toBeNull(); // Atlántico
  });

  it('aplica los ajustes de fronteras del generador', () => {
    expect(idAt(34.1, 45.0)).toBe('UKR'); // Crimea
    expect(idAt(44.06, 9.56)).toBe('SOM'); // Hargeisa (Somalilandia)
    expect(idAt(33.6, 35.3)).toBe('CYP'); // norte de Chipre
    expect(idAt(21.16, 42.66)).toBe('XKX'); // Pristina
    expect(idAt(179.2, -8.52)).toBe('TUV'); // Tuvalu (sintético)
  });

  it('respeta los enclaves', () => {
    expect(idAt(28.2, -29.5)).toBe('LSO'); // Lesoto, dentro de Sudáfrica
    expect(idAt(12.434, 41.902)).toBe('VAT'); // Vaticano, dentro de Italia (tal como lo dibuja Natural Earth)
    expect(idAt(12.46, 43.94)).toBe('SMR'); // San Marino
    expect(idAt(12.6, 41.8)).toBe('ITA');
  });

  it('corta bien los países que cruzan el antimeridiano', () => {
    expect(idAt(172, 66)).toBe('RUS'); // Chukotka, al oeste del antimeridiano
    expect(idAt(-175, 66)).toBe('RUS'); // Chukotka, al este del antimeridiano
    expect(idAt(178.0, -17.8)).toBe('FJI'); // Viti Levu
    expect(idAt(0, -80)).toBe('ATA');
    expect(idAt(-179.5, -85)).toBe('ATA');
    expect(idAt(179.5, -85)).toBe('ATA');
  });

  it('cada país apunta a un ancla dentro de su propio territorio', () => {
    for (const c of atlas.countries) {
      expect(idAt(c.anchor[0], c.anchor[1]), c.id).toBe(c.id);
    }
  });

  it('los vecinos nunca comparten color en el mapa político', () => {
    for (const c of atlas.countries) {
      for (const n of c.neighbors) expect(atlas.countries[n].color, `${c.id}-${atlas.countries[n].id}`).not.toBe(c.color);
    }
  });
});

describe('clipRing', () => {
  const square = [0, 0, 10, 0, 10, 10, 0, 10];
  const area = (r: number[]) => {
    let s = 0;
    for (let i = 0; i < r.length; i += 2) {
      const j = (i + 2) % r.length;
      s += r[i] * r[j + 1] - r[j] * r[i + 1];
    }
    return Math.abs(s / 2);
  };

  it('recorta contra una banda', () => {
    expect(area(clipRing(square, 0, 2, 5))).toBeCloseTo(30);
    expect(area(clipRing(square, 1, -5, 4))).toBeCloseTo(40);
    expect(clipRing(square, 0, 20, 30)).toHaveLength(0);
    expect(area(clipRing(square, 0, -5, 50))).toBeCloseTo(100);
  });

  it('une con el borde los trozos de un anillo cóncavo', () => {
    // una "U": al recortar por arriba quedan dos patas unidas por el borde de la banda
    const u = [0, 0, 9, 0, 9, 10, 6, 10, 6, 3, 3, 3, 3, 10, 0, 10];
    expect(area(clipRing(u, 1, 5, 10))).toBeCloseTo(30);
  });
});

describe('malla', () => {
  const t0 = performance.now();
  const mesh = buildMesh(atlas);
  const ms = performance.now() - t0;
  const DEG = Math.PI / 180;

  it('se construye en un tiempo razonable', () => {
    console.log(
      `malla: ${mesh.fill.length / 3} vértices, ${mesh.fillIndex.length / 3} triángulos, ` +
        `${mesh.edges.length / 2} aristas en ${ms.toFixed(0)} ms`,
    );
    expect(ms).toBeLessThan(3000);
  });

  it('cubre exactamente el área de cada país', () => {
    const triArea = new Float64Array(atlas.countries.length);
    for (let i = 0; i < mesh.fillIndex.length; i += 3) {
      const a = mesh.fillIndex[i] * 3;
      const b = mesh.fillIndex[i + 1] * 3;
      const c = mesh.fillIndex[i + 2] * 3;
      const ax = mesh.fill[a] / DEG;
      const ay = mesh.fill[a + 1] / DEG;
      triArea[mesh.fill[a + 2]] += Math.abs(
        (mesh.fill[b] / DEG - ax) * (mesh.fill[c + 1] / DEG - ay) - (mesh.fill[c] / DEG - ax) * (mesh.fill[b + 1] / DEG - ay),
      ) / 2;
    }
    for (const country of atlas.countries) {
      let expected = 0;
      for (const polygon of country.polygons) {
        polygon.rings.forEach((ring, r) => {
          let s = 0;
          for (let i = 0; i < ring.length; i += 2) {
            const j = (i + 2) % ring.length;
            s += ring[i] * ring[j + 1] - ring[j] * ring[i + 1];
          }
          expected += (r === 0 ? 1 : -1) * Math.abs(s / 2);
        });
      }
      // tolerancia: precisión de float32 en los vértices (≈1e-5°) por el perímetro
      const tol = Math.max(expected * 2e-4, 1e-6);
      expect(Math.abs(triArea[country.index] - expected), country.id).toBeLessThan(tol);
    }
  });

  it('ningún triángulo es más largo que la diagonal de una celda', () => {
    const limit = CELL * Math.SQRT2 * 1.001;
    for (let i = 0; i < mesh.fillIndex.length; i += 3) {
      for (let k = 0; k < 3; k++) {
        const a = mesh.fillIndex[i + k] * 3;
        const b = mesh.fillIndex[i + ((k + 1) % 3)] * 3;
        const d = Math.hypot(mesh.fill[a] - mesh.fill[b], mesh.fill[a + 1] - mesh.fill[b + 1]) / DEG;
        if (d > limit) throw new Error(`arista de ${d.toFixed(2)}° en el país ${atlas.countries[mesh.fill[a + 2]].id}`);
      }
    }
  });

  it('marca como artificiales los cortes del antimeridiano y del polo', () => {
    let artificial = 0;
    for (let i = 0; i < mesh.edgeIsBorder.length; i++) if (!mesh.edgeIsBorder[i]) artificial++;
    expect(artificial).toBeGreaterThan(100);
    expect(artificial).toBeLessThan(2500);
  });
});

describe('climas', () => {
  const climateOf = (id: string) => atlas.countries[atlas.indexOf(id)].climate;

  it('todos los países del cuestionario tienen al menos un clima', () => {
    for (const index of atlas.quizzable) expect(atlas.countries[index].climate.length, atlas.countries[index].name).toBeGreaterThan(0);
  });

  it('los casos de libro de texto salen como se estudian', () => {
    expect(climateOf('ESP').slice(0, 2)).toEqual(['mediterraneo', 'oceanico']);
    expect(climateOf('DZA')[0]).toBe('desertico');
    expect(climateOf('GBR')).toEqual(['oceanico']);
    expect(climateOf('POL')).toEqual(['continental']);
    expect(climateOf('RUS')).toEqual(['continental', 'polar']);
    expect(climateOf('IDN')[0]).toBe('ecuatorial');
    expect(climateOf('CUB')).toEqual(['tropical']);
    expect(climateOf('CHL')).toContain('mediterraneo');
    expect(climateOf('AND')).toEqual(['montana']);
  });
});

// España por provincias (scripts/build-maps.mjs): mismo formato, otro atlas.
describe('atlas de España', () => {
  const rawSpain = JSON.parse(readFileSync('public/data/es/atlas.json', 'utf8')) as RawAtlas;
  const spain = new Atlas(rawSpain, 'es');
  const provinces = spain.quizzable.map((i) => spain.countries[i]);
  const where = (lon: number, lat: number) => {
    const i = spain.locate(lon, lat);
    return i < 0 ? null : spain.countries[i].id;
  };

  it('tiene las 50 provincias, Ceuta y Melilla, cada una con capital y comunidad', () => {
    expect(provinces).toHaveLength(52);
    expect(provinces.map((p) => p.id)).toContain('ES-CE');
    expect(provinces.map((p) => p.id)).toContain('ES-ML');
    for (const p of provinces) {
      expect(p.id, p.name).toMatch(/^ES-[A-Z]{1,2}$/);
      expect(p.capital, p.id).toBeTruthy();
      expect(p.regions, p.id).toHaveLength(1);
      expect(spain.regions[p.regions[0]]?.name, p.id).toBeTruthy();
      expect(p.polygons.length, p.id).toBeGreaterThan(0);
    }
    expect(new Set(provinces.map((p) => p.name)).size).toBe(52);
    expect(new Set(provinces.map((p) => p.capital)).size).toBe(52);
  });

  it('tiene las 17 comunidades autónomas y las dos ciudades autónomas, todas con provincias', () => {
    const keys = Object.keys(spain.regions);
    expect(keys).toHaveLength(19);
    const size = (key: string) => provinces.filter((p) => p.regions[0] === key).length;
    for (const key of keys) expect(size(key), key).toBeGreaterThan(0);
    expect(keys.filter((key) => size(key) > 1)).toHaveLength(10);
    expect(size('ES-AN')).toBe(8);
    expect(size('ES-CL')).toBe(9);
    expect(size('ES-CM')).toBe(5);
    expect(size('ES-CT')).toBe(4);
    expect(size('ES-GA')).toBe(4);
    expect(size('ES-PV')).toBe(3);
    expect(spain.regions['ES-CE'].name).toBe('Ceuta');
    expect(spain.regions['ES-ML'].name).toBe('Melilla');
    const of = (id: string) => spain.regions[spain.byIdOrThrow(id).regions[0]].name;
    expect(of('ES-A')).toBe('Comunidad Valenciana');
    expect(of('ES-LE')).toBe('Castilla y León');
    expect(of('ES-AB')).toBe('Castilla-La Mancha');
    expect(of('ES-TF')).toBe('Canarias');
  });

  it('localiza la provincia de un punto, islas y ciudades autónomas incluidas', () => {
    expect(where(-3.7, 40.42)).toBe('ES-M'); // Madrid
    expect(where(-0.38, 39.47)).toBe('ES-V'); // Valencia
    expect(where(-0.7, 38.27)).toBe('ES-A'); // Elche
    expect(where(-5.99, 37.39)).toBe('ES-SE'); // Sevilla
    expect(where(-2.67, 42.85)).toBe('ES-VI'); // Vitoria
    expect(where(-2.72, 42.73)).toBe('ES-BU'); // Treviño, enclave de Burgos dentro de Álava
    expect(where(3.0, 39.62)).toBe('ES-PM'); // Mallorca
    expect(where(-15.6, 27.96)).toBe('ES-GC'); // Gran Canaria
    expect(where(-16.55, 28.27)).toBe('ES-TF'); // Tenerife
    expect(where(-5.33, 35.89)).toBe('ES-CE'); // Ceuta
    expect(where(-2.945, 35.29)).toBe('ES-ML'); // Melilla
    expect(where(-12, 36)).toBeNull(); // Atlántico
  });

  it('los países de alrededor son decorado: se dibujan, pero ni se preguntan ni tienen nombre que traducir', () => {
    const context = spain.countries.filter((c) => c.kind === 'context');
    expect(context.map((c) => c.id).sort()).toEqual(['AND', 'DZA', 'FRA', 'MAR', 'PRT', 'SAH']);
    expect(where(-8, 39.5)).toBe('PRT');
    expect(where(2.35, 48.86)).toBe('FRA');
    expect(spain.countries.every((c) => c.kind === 'country' || c.kind === 'context')).toBe(true);
    for (const p of provinces) for (const n of p.neighbors) expect(spain.countries[n].kind, p.id).toBe('country');
    // Vecinas con frontera de verdad; las islas y las ciudades autónomas no tienen.
    const names = (id: string) => spain.byIdOrThrow(id).neighbors.map((n) => spain.countries[n].id).sort();
    expect(names('ES-M')).toEqual(['ES-AV', 'ES-CU', 'ES-GU', 'ES-SG', 'ES-TO']);
    expect(names('ES-PM')).toEqual([]);
    expect(names('ES-CE')).toEqual([]);
  });

  it('la vista general encuadra España, con Canarias', () => {
    expect(spain.frame).not.toBeNull();
    const [w, s, e, n] = spain.frame!;
    expect(w).toBeLessThan(-18);
    expect(s).toBeLessThan(27.7);
    expect(e).toBeGreaterThan(4.3);
    expect(n).toBeGreaterThan(43.7);
    expect(atlas.frame).toBeNull();
  });

  it('dos provincias vecinas nunca comparten color', () => {
    for (const p of provinces) for (const n of p.neighbors) expect(spain.countries[n].color, `${p.id}`).not.toBe(p.color);
  });

  it('cada idioma tiene nombre y capital para las 52, y nombre para las 19 comunidades', () => {
    for (const lang of ['en', 'fr', 'de', 'it', 'pt', 'ca', 'gl', 'eu', 'zh']) {
      const names = JSON.parse(readFileSync(`public/data/es/names.${lang}.json`, 'utf8'));
      for (const p of provinces) {
        expect(names.countries[p.id]?.n, `${lang} ${p.id}`).toBeTruthy();
        expect(names.countries[p.id]?.c, `${lang} ${p.id}`).toBeTruthy();
      }
      for (const key of Object.keys(spain.regions)) expect(names.regions[key], `${lang} ${key}`).toBeTruthy();
      expect(new Set(provinces.map((p) => names.countries[p.id].n)).size, lang).toBe(52);
    }
    const eu = JSON.parse(readFileSync('public/data/es/names.eu.json', 'utf8'));
    expect(eu.countries['ES-BI']).toMatchObject({ n: 'Bizkaia', c: 'Bilbo' });
    // Al escribir también vale el nombre en español.
    expect(eu.countries['ES-BI'].a).toContain('Vizcaya');
    const ca = JSON.parse(readFileSync('public/data/es/names.ca.json', 'utf8'));
    expect(ca.countries['ES-A'].n).toBe('Alacant');
    expect(ca.regions['ES-VC']).toBe('Comunitat Valenciana');
  });

  it('se triangula entero, sin provincias vacías', () => {
    const spainMesh = buildMesh(spain);
    const seen = new Set<number>();
    for (let i = 2; i < spainMesh.fill.length; i += 3) seen.add(spainMesh.fill[i]);
    expect(seen.size).toBe(spain.countries.length);
  });
});
