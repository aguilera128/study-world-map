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
