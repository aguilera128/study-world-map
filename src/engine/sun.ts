// Posición del Sol para pintar el día y la noche. Fórmulas de baja precisión del Astronomical
// Almanac: aciertan a la centésima de grado, de sobra para un mapa.

const RAD = Math.PI / 180;
/** 1 de enero de 2000 a las 12:00 UTC (época J2000), en milisegundos Unix. */
const J2000 = Date.UTC(2000, 0, 1, 12);

export interface SunPosition {
  /** Punto subsolar: el lugar de la Tierra que tiene el Sol justo encima. En grados. */
  lon: number;
  lat: number;
}

/** Dónde está el Sol en el cénit en un instante dado. */
export function subsolarPoint(date: Date): SunPosition {
  const days = (date.getTime() - J2000) / 86_400_000;
  const meanAnomaly = (357.529 + 0.98560028 * days) * RAD;
  const meanLongitude = 280.459 + 0.98564736 * days;
  const eclipticLongitude = (meanLongitude + 1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly)) * RAD;
  const obliquity = (23.439 - 0.00000036 * days) * RAD;
  const rightAscension = Math.atan2(Math.cos(obliquity) * Math.sin(eclipticLongitude), Math.cos(eclipticLongitude)) / RAD;
  const declination = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLongitude)) / RAD;
  // Hora sidérea media de Greenwich, en grados: cuánto ha girado la Tierra respecto a las estrellas.
  const siderealTime = (18.697374558 + 24.06570982441908 * days) * 15;
  const lon = ((((rightAscension - siderealTime) % 360) + 540) % 360) - 180;
  return { lon, lat: declination };
}

/** Altura del Sol sobre el horizonte (grados) en un lugar: positiva de día, negativa de noche. */
export function sunAltitude(sun: SunPosition, lon: number, lat: number): number {
  const cos =
    Math.sin(lat * RAD) * Math.sin(sun.lat * RAD) +
    Math.cos(lat * RAD) * Math.cos(sun.lat * RAD) * Math.cos((lon - sun.lon) * RAD);
  return Math.asin(Math.max(-1, Math.min(1, cos))) / RAD;
}

export type DayPhase = 'day' | 'twilight' | 'night';

/** Día, crepúsculo (el Sol hasta 6° bajo el horizonte) o noche. */
export function dayPhase(altitude: number): DayPhase {
  if (altitude > -0.833) return 'day';
  return altitude > -6 ? 'twilight' : 'night';
}

// ───────────────────────── Luna ─────────────────────────

const sinD = (deg: number) => Math.sin(deg * RAD);

/** Punto sublunar: el lugar de la Tierra que tiene la Luna justo encima. Acierta a unos 0,3°. */
export function sublunarPoint(date: Date): SunPosition {
  const days = (date.getTime() - J2000) / 86_400_000;
  const t = days / 36525;
  // Serie de baja precisión del Astronomical Almanac (longitud y latitud eclípticas, en grados).
  const lambda =
    (218.32 +
      481267.881 * t +
      6.29 * sinD(135.0 + 477198.87 * t) -
      1.27 * sinD(259.3 - 413335.36 * t) +
      0.66 * sinD(235.7 + 890534.22 * t) +
      0.21 * sinD(269.9 + 954397.74 * t) -
      0.19 * sinD(357.5 + 35999.05 * t) -
      0.11 * sinD(186.5 + 966404.03 * t)) *
    RAD;
  const beta =
    (5.13 * sinD(93.3 + 483202.02 * t) +
      0.28 * sinD(228.2 + 960400.89 * t) -
      0.28 * sinD(318.3 + 6003.15 * t) -
      0.17 * sinD(217.6 - 407332.21 * t)) *
    RAD;
  const obliquity = (23.439 - 0.00000036 * days) * RAD;
  // Eclípticas → ecuatoriales.
  const x = Math.cos(beta) * Math.cos(lambda);
  const y = Math.cos(obliquity) * Math.cos(beta) * Math.sin(lambda) - Math.sin(obliquity) * Math.sin(beta);
  const z = Math.sin(obliquity) * Math.cos(beta) * Math.sin(lambda) + Math.cos(obliquity) * Math.sin(beta);
  const rightAscension = Math.atan2(y, x) / RAD;
  const siderealTime = (18.697374558 + 24.06570982441908 * days) * 15;
  const lon = ((((rightAscension - siderealTime) % 360) + 540) % 360) - 180;
  return { lon, lat: Math.asin(z) / RAD };
}

export interface MoonPhase {
  /** Parte del disco iluminada, de 0 (nueva) a 1 (llena). */
  lit: number;
  /** Creciente (de nueva a llena) o menguante. */
  waxing: boolean;
  name: string;
}

/** Fase de la Luna a partir de dónde están ella y el Sol: cuanto más separados, más llena. */
export function moonPhase(sun: SunPosition, moon: SunPosition): MoonPhase {
  const cos =
    Math.sin(sun.lat * RAD) * Math.sin(moon.lat * RAD) +
    Math.cos(sun.lat * RAD) * Math.cos(moon.lat * RAD) * Math.cos((moon.lon - sun.lon) * RAD);
  const lit = (1 - cos) / 2;
  // La Luna se retrasa cada día respecto al Sol: mientras crece va al este de él.
  const waxing = ((((moon.lon - sun.lon) % 360) + 360) % 360) < 180;
  const name =
    lit < 0.03
      ? 'Luna nueva'
      : lit > 0.97
        ? 'Luna llena'
        : Math.abs(lit - 0.5) < 0.06
          ? waxing
            ? 'Cuarto creciente'
            : 'Cuarto menguante'
          : waxing
            ? 'Luna creciente'
            : 'Luna menguante';
  return { lit, waxing, name };
}
