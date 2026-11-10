import { geoNaturalEarth1Raw } from 'd3-geo';
import { describe, expect, it } from 'vitest';
import {
  DEG,
  FLAT_HALF_HEIGHT,
  FLAT_HALF_WIDTH,
  naturalEarth,
  naturalEarthInverse,
  newSample,
  surface,
  wrapLon,
  type Vec2,
} from './projection';

const puntos: Vec2[] = [
  [0, 0],
  [-3.7, 40.4],
  [139.7, 35.7],
  [-58.4, -34.6],
  [179.9, 66],
  [-179.9, -89],
  [10, 89.5],
];

describe('Natural Earth', () => {
  it('coincide con la implementación de d3-geo', () => {
    for (const [lon, lat] of puntos) {
      const mine = naturalEarth(lon * DEG, lat * DEG, [0, 0]);
      const d3 = geoNaturalEarth1Raw(lon * DEG, lat * DEG);
      expect(mine[0]).toBeCloseTo(d3[0], 12);
      expect(mine[1]).toBeCloseTo(d3[1], 12);
    }
  });

  it('la inversa deshace la proyección', () => {
    for (const [lon, lat] of puntos) {
      const [x, y] = naturalEarth(lon * DEG, lat * DEG, [0, 0]);
      const out: Vec2 = [0, 0];
      expect(naturalEarthInverse(x, y, out)).toBe(true);
      expect(out[0] / DEG).toBeCloseTo(lon, 6);
      expect(out[1] / DEG).toBeCloseTo(lat, 6);
    }
  });

  it('detecta los puntos fuera del mapa', () => {
    const out: Vec2 = [0, 0];
    expect(naturalEarthInverse(FLAT_HALF_WIDTH * 1.01, 0, out)).toBe(false);
    expect(naturalEarthInverse(0, FLAT_HALF_HEIGHT * 1.01, out)).toBe(false);
    // en los polos el mapa es más estrecho que en el ecuador
    expect(naturalEarthInverse(FLAT_HALF_WIDTH * 0.9, FLAT_HALF_HEIGHT * 0.99, out)).toBe(false);
    expect(naturalEarthInverse(FLAT_HALF_WIDTH * 0.99, 0, out)).toBe(true);
  });

  it('las constantes del contorno son las de la proyección', () => {
    expect(naturalEarth(Math.PI, 0, [0, 0])[0]).toBeCloseTo(FLAT_HALF_WIDTH, 10);
    expect(naturalEarth(0, Math.PI / 2, [0, 0])[1]).toBeCloseTo(FLAT_HALF_HEIGHT, 5);
  });
});

describe('surface', () => {
  const s = newSample();

  it('con morph = 1 es la esfera unidad', () => {
    for (const [lon, lat] of puntos) {
      surface(lon * DEG, lat * DEG, 1, 0, s);
      const cl = Math.cos(lat * DEG);
      expect(s.px).toBeCloseTo(cl * Math.sin(lon * DEG), 12);
      expect(s.py).toBeCloseTo(Math.sin(lat * DEG), 12);
      expect(s.pz).toBeCloseTo(cl * Math.cos(lon * DEG), 12);
      // en la esfera la normal coincide con la posición
      expect(s.nx).toBeCloseTo(s.px, 12);
      expect(s.ny).toBeCloseTo(s.py, 12);
      expect(s.nz).toBeCloseTo(s.pz, 12);
    }
  });

  it('con morph = 0 es el mapa plano sobre z = 1', () => {
    for (const [lon, lat] of puntos) {
      surface(lon * DEG, lat * DEG, 0, 0, s);
      const [x, y] = naturalEarth(lon * DEG, lat * DEG, [0, 0]);
      expect(s.px).toBeCloseTo(x, 12);
      expect(s.py).toBeCloseTo(y, 12);
      expect(s.pz).toBeCloseTo(1, 12);
      // (+ 0 convierte −0 en 0)
      expect([s.nx + 0, s.ny + 0, s.nz + 0]).toEqual([0, 0, 1]);
      expect([s.tx + 0, s.ty + 0, s.tz + 0]).toEqual([0, 1, 0]);
    }
  });

  it('es continua cuando morph tiende a 0', () => {
    for (const [lon, lat] of puntos) {
      const a = { ...surface(lon * DEG, lat * DEG, 0, 0.01, s) };
      const b = { ...surface(lon * DEG, lat * DEG, 1e-7, 0.01, s) };
      expect(b.px).toBeCloseTo(a.px, 5);
      expect(b.py).toBeCloseTo(a.py, 5);
      expect(b.pz).toBeCloseTo(a.pz, 5);
    }
  });

  it('normal y norte son unitarios y perpendiculares en cualquier punto del morph', () => {
    for (const morph of [0, 0.2, 0.5, 0.8, 1]) {
      for (const [lon, lat] of puntos) {
        surface(lon * DEG, lat * DEG, morph, 0, s);
        expect(Math.hypot(s.nx, s.ny, s.nz)).toBeCloseTo(1, 12);
        expect(Math.hypot(s.tx, s.ty, s.tz)).toBeCloseTo(1, 12);
        expect(s.nx * s.tx + s.ny * s.ty + s.nz * s.tz).toBeCloseTo(0, 12);
      }
    }
  });

  it('la altura desplaza el punto a lo largo de la normal', () => {
    for (const morph of [0, 0.4, 1]) {
      const base = { ...surface(0.7, 0.5, morph, 0, s) };
      const up = surface(0.7, 0.5, morph, 0.25, s);
      expect(up.px - base.px).toBeCloseTo(0.25 * base.nx, 12);
      expect(up.py - base.py).toBeCloseTo(0.25 * base.ny, 12);
      expect(up.pz - base.pz).toBeCloseTo(0.25 * base.nz, 12);
    }
  });
});

describe('wrapLon', () => {
  it('deja la longitud en (−π, π]', () => {
    expect(wrapLon(0)).toBeCloseTo(0);
    expect(wrapLon(Math.PI + 0.1)).toBeCloseTo(-Math.PI + 0.1);
    expect(wrapLon(-Math.PI - 0.1)).toBeCloseTo(Math.PI - 0.1);
    expect(wrapLon(5 * Math.PI)).toBeCloseTo(Math.PI);
  });
});
