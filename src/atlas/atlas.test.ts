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
