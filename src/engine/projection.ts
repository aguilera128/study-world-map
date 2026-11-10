// Matemáticas de la superficie del mapa, compartidas por la cámara y la detección del país bajo
// el cursor. Las mismas fórmulas están escritas en GLSL en ./shaders.ts: si cambias unas, cambia
// las otras.
//
// La superficie depende de un parámetro `morph`:
//   morph = 1 → esfera de radio 1 centrada en el origen (longitud 0 mirando a +Z, norte en +Y)
//   morph = 0 → mapa plano en la proyección Natural Earth sobre el plano z = 1
// Entre medias el mapa se "desenrolla": es un trozo de una esfera de radio 1/morph que se va
// haciendo cada vez más grande (y, por tanto, más plana) sin dejar de tocar el punto (0, 0, 1).

export const DEG = Math.PI / 180;

/** Semiancho y semialto del mapa plano (la esfera tiene radio 1). */
export const FLAT_HALF_WIDTH = Math.PI * 0.8707;
export const FLAT_HALF_HEIGHT = 1.42239;

export type Vec2 = [number, number];

/** Proyección Natural Earth I (Šavrič et al., 2011). Ángulos en radianes. */
export function naturalEarth(lon: number, lat: number, out: Vec2): Vec2 {
  const p2 = lat * lat;
  const p4 = p2 * p2;
  out[0] = lon * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)));
  out[1] = lat * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
  return out;
}

/**
 * Inversa de Natural Earth: punto del plano → [lon, lat] en radianes.
 * Devuelve false si el punto cae fuera del contorno del mapa (y deja en `out` el punto más cercano).
 */
export function naturalEarthInverse(x: number, y: number, out: Vec2): boolean {
  let inside = Math.abs(y) <= FLAT_HALF_HEIGHT;
  const yc = Math.max(-FLAT_HALF_HEIGHT, Math.min(FLAT_HALF_HEIGHT, y));
  let lat = yc;
  for (let i = 0; i < 25; i++) {
    const p2 = lat * lat;
    const p4 = p2 * p2;
    const f = lat * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4))) - yc;
    const df = 1.007226 + p2 * (0.015085 * 3 + p4 * (-0.044475 * 7 + 0.028874 * 9 * p2 - 0.005916 * 11 * p4));
    const delta = f / df;
    lat -= delta;
    if (Math.abs(delta) < 1e-9) break;
  }
  lat = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, lat));
  const p2 = lat * lat;
  const p4 = p2 * p2;
  let lon = x / (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)));
  if (Math.abs(lon) > Math.PI) {
    inside = false;
    lon = Math.sign(lon) * Math.PI;
  }
  out[0] = lon;
  out[1] = lat;
  return inside;
}

/** Punto de la superficie con su normal y la dirección "norte" (la vertical del mapa). */
export interface SurfaceSample {
  px: number;
  py: number;
  pz: number;
  nx: number;
  ny: number;
  nz: number;
  tx: number;
  ty: number;
  tz: number;
}

export const newSample = (): SurfaceSample => ({ px: 0, py: 0, pz: 0, nx: 0, ny: 0, nz: 1, tx: 0, ty: 1, tz: 0 });

const sinc = (x: number) => (Math.abs(x) < 1e-4 ? 1 - (x * x) / 6 : Math.sin(x) / x);
const flat: Vec2 = [0, 0];

/**
 * Posición del punto (lon, lat) a una altura `alt` sobre la superficie, para un `morph` dado.
 * Está escrita con sinc() para que no pierda precisión cuando morph → 0 (radio → ∞).
 */
export function surface(lon: number, lat: number, morph: number, alt: number, out: SurfaceSample): SurfaceSample {
  naturalEarth(lon, lat, flat);
  const u = flat[0] + (lon - flat[0]) * morph;
  const v = flat[1] + (lat - flat[1]) * morph;
  const a = u * morph;
  const b = v * morph;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const cb = Math.cos(b);
  const sb = Math.sin(b);
  const sha = sinc(a / 2);
  const shb = sinc(b / 2);
  out.nx = cb * sa;
  out.ny = sb;
  out.nz = cb * ca;
  out.tx = -sb * sa;
  out.ty = cb;
  out.tz = -sb * ca;
  out.px = cb * u * sinc(a) + alt * out.nx;
  out.py = v * sinc(b) + alt * out.ny;
  out.pz = 1 - 0.5 * morph * (v * v * shb * shb + cb * u * u * sha * sha) + alt * out.nz;
  return out;
}

/** Lleva una longitud en radianes al intervalo (−π, π]. */
export function wrapLon(lon: number): number {
  const t = (lon + Math.PI) % (2 * Math.PI);
  return (t <= 0 ? t + 2 * Math.PI : t) - Math.PI;
}
