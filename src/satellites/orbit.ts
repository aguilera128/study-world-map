import { eciToEcf, eciToGeodetic, gstime, json2satrec, propagate, type SatRec } from 'satellite.js';
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

/**
 * Una vuelta de la órbita en el espacio, a partir de `date`: `samples + 1` posiciones (la última,
 * una vuelta después, cierra la elipse) en radios terrestres, en el marco inercial con los ejes del
 * globo (x hacia 90°, y al norte, z hacia el equinoccio). Para llevarla al globo en otro momento
 * basta girarla `-siderealTime(momento)` alrededor del eje norte (ver `toGlobe`). Null si SGP4 falla.
 */
export function orbitPath(rec: SatRec, date: Date, samples = 96): Float32Array | null {
  const period = (2 * Math.PI) / rec.no; // minutos: «no» va en radianes por minuto
  const out = new Float32Array((samples + 1) * 3);
  for (let k = 0; k <= samples; k++) {
    const pv = propagate(rec, new Date(date.getTime() + (k / samples) * period * 60_000));
    if (!pv) return null;
    out[k * 3] = pv.position.y / EARTH_RADIUS_KM;
    out[k * 3 + 1] = pv.position.z / EARTH_RADIUS_KM;
    out[k * 3 + 2] = pv.position.x / EARTH_RADIUS_KM;
  }
  return out;
}

/** Lleva un punto de `orbitPath` al globo en la hora sidérea `gmst`: el mismo giro que hace el motor con la línea. */
export function toGlobe(x: number, y: number, z: number, gmst: number): [number, number, number] {
  const [c, s] = [Math.cos(gmst), Math.sin(gmst)];
  return [x * c - z * s, y, x * s + z * c];
}

/** Longitud y latitud (grados) y altura sobre la superficie (radios) de una posición en el marco del globo. */
export function geoOf(x: number, y: number, z: number): { lon: number; lat: number; alt: number } {
  const r = Math.hypot(x, y, z);
  return { lon: (Math.atan2(x, z) * 180) / Math.PI, lat: (Math.asin(y / r) * 180) / Math.PI, alt: r - 1 };
}

/** Lo que enseña la ficha de un satélite en un momento dado, todo calculado con SGP4 a partir de sus elementos. */
export interface SatNow {
  /** Altura sobre el elipsoide terrestre, en km. */
  altitudeKm: number;
  /** Velocidad en su órbita (respecto a las estrellas, no al suelo), en km/h. */
  speedKmh: number;
  /** Lo que tarda en dar una vuelta, en minutos. */
  periodMin: number;
  /** Inclinación de la órbita respecto al ecuador, en grados. */
  inclinationDeg: number;
  /** El punto de la Tierra que tiene debajo, en grados. */
  lon: number;
  lat: number;
}

export function satNow(rec: SatRec, date: Date): SatNow | null {
  const pv = propagate(rec, date);
  if (!pv) return null;
  const geo = eciToGeodetic(pv.position, gstime(date));
  const v = pv.velocity;
  return {
    altitudeKm: geo.height,
    speedKmh: Math.hypot(v.x, v.y, v.z) * 3600,
    periodMin: (2 * Math.PI) / rec.no,
    inclinationDeg: (rec.inclo * 180) / Math.PI,
    lon: (geo.longitude * 180) / Math.PI,
    lat: (geo.latitude * 180) / Math.PI,
  };
}
