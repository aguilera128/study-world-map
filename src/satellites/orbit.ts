import { eciToEcf, gstime, json2satrec, propagate, type SatRec } from 'satellite.js';
import { EARTH_RADIUS_KM, type SatRow } from './format';

// Dónde está ahora cada satélite: SGP4 (satellite.js) a partir de sus elementos orbitales. La
// aplicación carga este módulo con import() solo al encender la capa, para que satellite.js no
// entre en el código inicial.
//
// Las posiciones salen en el marco del globo del mapa, que gira con la Tierra y mide 1 de radio:
// x hacia 90° E, y hacia el polo norte, z hacia el meridiano de Greenwich (src/engine/projection.ts).

export type { SatRec };

/** Lo que necesita SGP4, a partir de una fila; null si los elementos no valen. */
export function satrecOf(row: SatRow): SatRec | null {
  const [name, norad, epoch, meanMotion, eccentricity, inclination, raan, argPericenter, meanAnomaly, bstar, meanMotionDot, meanMotionDdot] = row;
  try {
    const rec = json2satrec({
      OBJECT_NAME: name,
      OBJECT_ID: '',
      EPOCH: epoch,
      MEAN_MOTION: meanMotion,
      ECCENTRICITY: eccentricity,
      INCLINATION: inclination,
      RA_OF_ASC_NODE: raan,
      ARG_OF_PERICENTER: argPericenter,
      MEAN_ANOMALY: meanAnomaly,
      NORAD_CAT_ID: norad,
      ELEMENT_SET_NO: 999,
      BSTAR: bstar,
      MEAN_MOTION_DOT: meanMotionDot,
      MEAN_MOTION_DDOT: meanMotionDdot,
    });
    return rec.error ? null : rec;
  } catch {
    return null;
  }
}

/**
 * Escribe en `out[at…at+2]` la posición del satélite en el marco del globo (en radios terrestres)
 * para la hora `gmst` (hora sidérea de Greenwich de `date`). Devuelve false si SGP4 no da posición
 * (el satélite ya ha caído o los elementos están muy pasados): entonces escribe ceros.
 */
export function positionAt(rec: SatRec, date: Date, gmst: number, out: Float32Array | number[], at = 0): boolean {
  const pv = propagate(rec, date);
  if (!pv) {
    out[at] = out[at + 1] = out[at + 2] = 0;
    return false;
  }
  const ecf = eciToEcf(pv.position, gmst);
  out[at] = ecf.y / EARTH_RADIUS_KM;
  out[at + 1] = ecf.z / EARTH_RADIUS_KM;
  out[at + 2] = ecf.x / EARTH_RADIUS_KM;
  return true;
}

export const siderealTime = (date: Date) => gstime(date);

/** Longitud y latitud (grados) y altura sobre la superficie (radios) de una posición en el marco del globo. */
export function geoOf(x: number, y: number, z: number): { lon: number; lat: number; alt: number } {
  const r = Math.hypot(x, y, z);
  return { lon: (Math.atan2(x, z) * 180) / Math.PI, lat: (Math.asin(y / r) * 180) / Math.PI, alt: r - 1 };
}
