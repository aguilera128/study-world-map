import earcut from 'earcut';
import type { Atlas } from './atlas';
import type { Polygon } from './types';

/**
 * Lado (grados) de las celdas en que se trocean los polígonos grandes antes de triangular.
 *
 * earcut por sí solo une vértices muy lejanos (triángulos que cruzan Rusia de punta a punta) y
 * esos triángulos, al ser planos, atravesarían el globo. Troceando primero por una rejilla ningún
 * triángulo mide más que la diagonal de una celda y la malla se curva bien sobre la esfera.
 */
export const CELL = 3;

const DEG = Math.PI / 180;

export interface MeshData {
  /** Vértices de relleno: [lon, lat, país] por vértice (ángulos en radianes). */
  fill: Float32Array;
  fillIndex: Uint32Array;
  /** Vértices de los anillos (contornos y paredes): [lon, lat, país]. */
  ring: Float32Array;
  /** Aristas de anillo: pares de índices sobre `ring`. */
  edges: Uint32Array;
  /** 1 si la arista es una frontera o costa real; 0 si es un corte artificial (antimeridiano o polo). */
  edgeIsBorder: Uint8Array;
}

type Ring = ArrayLike<number>;

function addPoint(out: number[], x: number, y: number) {
  const n = out.length;
  if (n >= 2 && out[n - 2] === x && out[n - 1] === y) return;
  out.push(x, y);
}

function addCrossing(out: number[], ax: number, ay: number, bx: number, by: number, k: number, axis: 0 | 1) {
  if (axis === 0) addPoint(out, k, ay + ((by - ay) * (k - ax)) / (bx - ax));
  else addPoint(out, ax + ((bx - ax) * (k - ay)) / (by - ay), k);
}

/**
 * Recorta un anillo cerrado contra la banda k1 ≤ coord ≤ k2 (Sutherland–Hodgman con las dos rectas
 * a la vez, como hace geojson-vt). El resultado sigue siendo un único anillo: si el original entra
 * y sale varias veces, los trozos quedan unidos por tramos sobre el borde de la banda.
 */
export function clipRing(ring: Ring, axis: 0 | 1, k1: number, k2: number): number[] {
  const out: number[] = [];
  const n = ring.length / 2;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ax = ring[2 * i];
    const ay = ring[2 * i + 1];
    const bx = ring[2 * j];
    const by = ring[2 * j + 1];
    const a = axis === 0 ? ax : ay;
    const b = axis === 0 ? bx : by;
    if (a < k1) {
      if (b > k1) addCrossing(out, ax, ay, bx, by, k1, axis); // entra por k1
    } else if (a > k2) {
      if (b < k2) addCrossing(out, ax, ay, bx, by, k2, axis); // entra por k2
    } else {
      addPoint(out, ax, ay);
    }
    if (b < k1 && a >= k1) addCrossing(out, ax, ay, bx, by, k1, axis); // sale por k1
    if (b > k2 && a <= k2) addCrossing(out, ax, ay, bx, by, k2, axis); // sale por k2
  }
  const m = out.length;
  if (m >= 4 && out[0] === out[m - 2] && out[1] === out[m - 1]) out.length = m - 2;
  return out;
}

function range(ring: Ring, axis: 0 | 1): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = axis; i < ring.length; i += 2) {
    const v = ring[i];
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  return [lo, hi];
}

/**
 * Desplazamiento de la rejilla en un eje para que ninguna línea corte un hueco (un enclave como
 * Lesoto): earcut es mucho más fiable cuando los huecos no tocan el borde del polígono exterior.
 */
function gridOffset(holes: Ring[], axis: 0 | 1): number {
  if (!holes.length) return 0;
  const spans = holes.map((h) => range(h, axis));
  for (let step = 0; step < 6; step++) {
    const offset = (step * CELL) / 6;
    if (spans.every(([lo, hi]) => Math.floor((lo - offset) / CELL) === Math.floor((hi - offset) / CELL))) return offset;
  }
  return 0;
}

class Builder {
  readonly fill: number[] = [];
  readonly fillIndex: number[] = [];
  readonly ring: number[] = [];
  readonly edges: number[] = [];
  readonly edgeIsBorder: number[] = [];

  /** Triangula un grupo de anillos (exterior + huecos) que ya cabe en una celda. */
  private earcutRings(rings: Ring[], country: number) {
    const coords: number[] = [];
    const holes: number[] = [];
    for (let r = 0; r < rings.length; r++) {
      if (r > 0) holes.push(coords.length / 2);
      const ring = rings[r];
      for (let i = 0; i < ring.length; i++) coords.push(ring[i]);
    }
    const triangles = earcut(coords, holes.length ? holes : undefined, 2);
    if (!triangles.length) return;
    const base = this.fill.length / 3;
    for (let i = 0; i < coords.length; i += 2) this.fill.push(coords[i] * DEG, coords[i + 1] * DEG, country);
    for (let i = 0; i < triangles.length; i++) this.fillIndex.push(base + triangles[i]);
  }

  private addFill(polygon: Polygon, country: number) {
    const { rings } = polygon;
    const [w, s, e, n] = polygon.bbox;
    if (e - w <= CELL && n - s <= CELL) {
      this.earcutRings(rings, country);
      return;
    }
    const holes = rings.slice(1);
    const ox = gridOffset(holes, 0);
    const oy = gridOffset(holes, 1);
    for (let gx = Math.floor((w - ox) / CELL); ox + gx * CELL < e; gx++) {
      const x1 = ox + gx * CELL;
      const strip = rings.map((r) => clipRing(r, 0, x1, x1 + CELL));
      if (strip[0].length < 6) continue;
      const [lo, hi] = range(strip[0], 1);
      for (let gy = Math.floor((lo - oy) / CELL); oy + gy * CELL < hi; gy++) {
        const y1 = oy + gy * CELL;
        const cell = strip.map((r) => (r.length < 6 ? r : clipRing(r, 1, y1, y1 + CELL)));
        if (cell[0].length < 6) continue;
        this.earcutRings(
          cell.filter((r, i) => i === 0 || r.length >= 6),
          country,
        );
      }
    }
  }

  private addRings(polygon: Polygon, country: number) {
    for (const ring of polygon.rings) {
      const n = ring.length / 2;
      const base = this.ring.length / 3;
      for (let i = 0; i < n; i++) this.ring.push(ring[2 * i] * DEG, ring[2 * i + 1] * DEG, country);
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        this.edges.push(base + i, base + j);
        // Los tramos que siguen el antimeridiano o un polo son cortes del mapa, no fronteras.
        const onSeam = Math.abs(ring[2 * i]) === 180 && Math.abs(ring[2 * j]) === 180;
        const onPole = Math.abs(ring[2 * i + 1]) === 90 && Math.abs(ring[2 * j + 1]) === 90;
        this.edgeIsBorder.push(onSeam || onPole ? 0 : 1);
      }
    }
  }

  add(polygon: Polygon, country: number) {
    this.addFill(polygon, country);
    this.addRings(polygon, country);
  }

  build(): MeshData {
    return {
      fill: Float32Array.from(this.fill),
      fillIndex: Uint32Array.from(this.fillIndex),
      ring: Float32Array.from(this.ring),
      edges: Uint32Array.from(this.edges),
      edgeIsBorder: Uint8Array.from(this.edgeIsBorder),
    };
  }
}

/** Convierte todos los polígonos del atlas en los búferes que dibuja el motor del mapa. */
export function buildMesh(atlas: Atlas): MeshData {
  const builder = new Builder();
  for (const country of atlas.countries) {
    for (const polygon of country.polygons) builder.add(polygon, country.index);
  }
  return builder.build();
}
