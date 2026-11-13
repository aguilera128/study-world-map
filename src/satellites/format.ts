// Cómo viajan los satélites del servidor al mapa. Solo constantes y cuentas: lo cargan tanto la
// función de Vercel (api/satelites.ts) como la aplicación, así que no puede importar nada más.
//
// La fuente son los elementos orbitales GP de CelesTrak (https://celestrak.org), en el formato OMM
// en JSON. De cada satélite se queda lo que necesita SGP4 para calcular dónde está, en una fila:
// [nombre, número NORAD, época, movimiento medio, excentricidad, inclinación, nodo ascendente,
// argumento del perigeo, anomalía media, BSTAR, derivada del movimiento medio, segunda derivada].

/** Los grupos de la capa, en el orden en que se pintan encima unos de otros (el primero, arriba). */
export const SAT_GROUPS = ['estaciones', 'navegacion', 'meteorologicos', 'starlink'] as const;
export type SatGroup = (typeof SAT_GROUPS)[number];
export const isSatGroup = (value: unknown): value is SatGroup => SAT_GROUPS.includes(value as SatGroup);

/** Los grupos de CelesTrak que forman cada uno. */
export const CELESTRAK_GROUPS: Record<SatGroup, readonly string[]> = {
  estaciones: ['stations'],
  navegacion: ['gps-ops', 'galileo'],
  meteorologicos: ['weather'],
  starlink: ['starlink'],
};

/** Color de cada grupo en el mapa y en la leyenda. */
export const SAT_COLORS: Record<SatGroup, string> = {
  estaciones: '#ff5a4e',
  navegacion: '#4fd1a5',
  meteorologicos: '#ffc34d',
  starlink: '#b8c4d6',
};

export type SatRow = [name: string, norad: number, epoch: string, meanMotion: number, eccentricity: number, inclination: number, raan: number, argPericenter: number, meanAnomaly: number, bstar: number, meanMotionDot: number, meanMotionDdot: number];

/** Lo que devuelve /api/satelites: de cuándo son los elementos (cuando se pidieron a CelesTrak) y los satélites. */
export interface SatPayload {
  fetched: string;
  sats: SatRow[];
}

const num = (value: unknown): number | null => {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
};

/** Una fila a partir de un registro OMM de CelesTrak, o null si le falta algo. */
export function toRow(omm: Record<string, unknown>): SatRow | null {
  const name = typeof omm.OBJECT_NAME === 'string' ? omm.OBJECT_NAME.trim() : '';
  const epoch = typeof omm.EPOCH === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?$/.test(omm.EPOCH) ? omm.EPOCH : null;
  const fields = ['NORAD_CAT_ID', 'MEAN_MOTION', 'ECCENTRICITY', 'INCLINATION', 'RA_OF_ASC_NODE', 'ARG_OF_PERICENTER', 'MEAN_ANOMALY', 'BSTAR', 'MEAN_MOTION_DOT', 'MEAN_MOTION_DDOT'].map((key) => num(omm[key]));
  if (!name || !epoch || fields.some((f) => f === null)) return null;
  const [norad, ...rest] = fields as number[];
  return [name, norad, epoch, ...(rest as [number, number, number, number, number, number, number, number, number])];
}

/** ¿Es una fila válida? (lo que llega al navegador no se da por bueno sin mirarlo). */
export const isSatRow = (row: unknown): row is SatRow =>
  Array.isArray(row) && row.length === 12 && typeof row[0] === 'string' && typeof row[2] === 'string' && row.every((v, i) => i === 0 || i === 2 || (typeof v === 'number' && Number.isFinite(v)));

/** Radio de la Tierra con el que se escala todo el mapa (el globo mide 1), en km. */
export const EARTH_RADIUS_KM = 6371;
/** Constante gravitatoria de la Tierra (WGS-72, la de SGP4), en km³/s². */
const MU = 398600.8;

/** Semieje mayor de la órbita, en km, a partir del movimiento medio (vueltas al día). */
export const semiMajorAxisKm = (meanMotion: number) => Math.cbrt(MU / ((meanMotion * 2 * Math.PI) / 86400) ** 2);
/** Periodo de la órbita, en minutos. */
export const periodMinutes = (meanMotion: number) => 1440 / meanMotion;

/**
 * Hasta dónde se dibuja, en radios terrestres desde el centro: el apogeo más alto que cabe en la
 * pantalla alejando la cámara de forma contenida. Llega a las órbitas de GPS y Galileo (4,2 y 4,6);
 * las geoestacionarias (6,6) y las muy elípticas quedan fuera (ver AGENTS.md).
 */
export const MAX_ORBIT_RADII = 5;
export const fitsOnMap = (row: SatRow) => (semiMajorAxisKm(row[3]) * (1 + row[4])) / EARTH_RADIUS_KM <= MAX_ORBIT_RADII;

/** Cada cuánto vuelven a pedir los elementos la aplicación y la red de Vercel: CelesTrak los renueva cada dos horas. */
export const SAT_REFRESH_HOURS = 6;
