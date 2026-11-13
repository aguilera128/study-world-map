// El tiempo «de ahora» en el servidor: baja del almacén abierto de la NOAA los cuatro campos del
// modelo GFS que hacen falta y los empaqueta en una imagen (ver ./format.ts), y pide a la NASA las
// teselas de la lluvia más reciente. Lo usa api/tiempo.ts; aquí no se ejecuta nada al importarlo.
//
// Fuentes:
//   · GFS (Global Forecast System), NOAA/NCEP, dominio público. Ficheros de 1° en el programa de
//     datos abiertos de la NOAA en AWS: https://noaa-gfs-bdp-pds.s3.amazonaws.com/ . Cada fichero
//     trae un índice (.idx) con la posición de cada campo, así que solo se bajan los cuatro que se
//     usan (unos 300 kB en total). El modelo corre cuatro veces al día y da un paso cada tres horas:
//     «ahora» es el paso más cercano de la última pasada publicada.
//   · Lluvia: IMERG (GPM), NASA, vía GIBS, dominio público. Es una observación de satélite, cada
//     media hora y con entre cinco y ocho horas de retraso (medido el 12-nov-2026).

import { crc32, deflateSync } from 'node:zlib';
import { decodeGrib2, type Grid } from './grib2.ts';
import { cloudToByte, GRID_ROWS, GRID_WIDTH, isRainTime, RAIN_LEVEL, tempToByte, windToByte } from './format.ts';

const HOUR = 3_600_000;
const GFS = 'https://noaa-gfs-bdp-pds.s3.amazonaws.com';
const GIBS = 'https://gibs.earthdata.nasa.gov';
const RAIN_LAYER = 'IMERG_Precipitation_Rate_30min';

type Fetch = typeof fetch;

export interface WeatherImage {
  png: Uint8Array<ArrayBuffer>;
  /** A qué hora corresponde el dato. */
  valid: Date;
}

export interface ModelRun {
  /** Hora de la pasada del modelo. */
  cycle: Date;
  /** Horas de previsión. */
  hour: number;
}

/**
 * Qué ficheros del modelo probar, del más reciente al más antiguo: de cada pasada (cada seis horas),
 * el paso de tres horas más cercano a ahora. Nunca el de análisis (hora 0), que no trae nubosidad.
 */
export function modelRuns(now: number, back = 4): ModelRun[] {
  const latest = Math.floor(now / (6 * HOUR)) * 6 * HOUR;
  return Array.from({ length: back }, (_, k) => {
    const cycle = latest - k * 6 * HOUR;
    return { cycle: new Date(cycle), hour: Math.max(3, Math.round((now - cycle) / (3 * HOUR)) * 3) };
  });
}

const two = (n: number) => String(n).padStart(2, '0');

/** Dirección del fichero de una pasada y un paso, sin extensión de índice. */
export function modelUrl({ cycle, hour }: ModelRun): string {
  const day = `${cycle.getUTCFullYear()}${two(cycle.getUTCMonth() + 1)}${two(cycle.getUTCDate())}`;
  const hh = two(cycle.getUTCHours());
  return `${GFS}/gfs.${day}/${hh}/atmos/gfs.t${hh}z.pgrb2.1p00.f${String(hour).padStart(3, '0')}`;
}

/** Los campos que se usan, como salen en el índice: variable, nivel y que sea el valor del momento. */
const FIELDS = {
  temp: /:TMP:2 m above ground:\d+ hour fcst:/,
  u: /:UGRD:10 m above ground:\d+ hour fcst:/,
  v: /:VGRD:10 m above ground:\d+ hour fcst:/,
  cloud: /:TCDC:entire atmosphere:\d+ hour fcst:/,
} as const;
type Field = keyof typeof FIELDS;

/** Del índice de un fichero, el tramo de bytes de cada campo. El último mensaje llega hasta el final. */
export function fieldRanges(index: string): Record<Field, string> {
  const lines = index.split('\n').filter(Boolean);
  const offset = (line: string) => Number(line.split(':')[1]);
  const out = {} as Record<Field, string>;
  for (const field of Object.keys(FIELDS) as Field[]) {
    const at = lines.findIndex((line) => FIELDS[field].test(line));
    if (at < 0) throw new Error(`El índice del modelo no trae «${field}».`);
    const next = at + 1 < lines.length ? offset(lines[at + 1]) - 1 : '';
    out[field] = `bytes=${offset(lines[at])}-${next}`;
  }
  return out;
}

/** Imagen PNG de 8 bits por canal, sin alfa, a partir de sus píxeles RGB por filas. */
export function encodePng(width: number, height: number, rgb: Uint8Array): Uint8Array<ArrayBuffer> {
  const chunk = (type: string, data: Uint8Array) => {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, 'latin1');
    out.set(data, 8);
    out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
    return out;
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8);
  // Cada fila lleva delante el tipo de filtro (0: ninguno).
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) raw.set(rgb.subarray(y * width * 3, (y + 1) * width * 3), y * (width * 3 + 1) + 1);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', header), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', new Uint8Array())]);
}

/** Los cuatro campos del modelo, en los píxeles de la imagen que se manda al mapa (ver ./format.ts). */
export function packModel(fields: Record<Field, Grid>): Uint8Array {
  for (const grid of Object.values(fields)) {
    if (grid.ni !== GRID_WIDTH || grid.nj !== GRID_ROWS || grid.lat0 !== 90 || grid.lon0 !== 0 || grid.dLat !== -1 || grid.dLon !== 1) {
      throw new Error('La rejilla del modelo no es la de un grado que se esperaba.');
    }
  }
  const rgb = new Uint8Array(GRID_WIDTH * GRID_ROWS * 2 * 3);
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_WIDTH; col++) {
      // El modelo empieza en el meridiano de Greenwich; la imagen, en el antimeridiano.
      const source = row * GRID_WIDTH + ((col + 180) % 360);
      const top = (row * GRID_WIDTH + col) * 3;
      rgb[top] = tempToByte(fields.temp.values[source] - 273.15);
      rgb[top + 1] = windToByte(fields.u.values[source]);
      rgb[top + 2] = windToByte(fields.v.values[source]);
      rgb[((row + GRID_ROWS) * GRID_WIDTH + col) * 3] = cloudToByte(fields.cloud.values[source]);
    }
  }
  return rgb;
}

/** El modelo de ahora: la última pasada publicada, en el paso más cercano a `now`. */
export async function fetchModel(now: number, get: Fetch = fetch): Promise<WeatherImage> {
  for (const run of modelRuns(now)) {
    const url = modelUrl(run);
    const index = await get(`${url}.idx`);
    // Una pasada tarda unas cuatro horas en publicarse: si aún no está, se prueba la anterior.
    if (!index.ok) continue;
    const ranges = fieldRanges(await index.text());
    const entries = await Promise.all(
      (Object.keys(ranges) as Field[]).map(async (field) => {
        const res = await get(url, { headers: { Range: ranges[field] } });
        if (!res.ok) throw new Error(`El modelo no ha dado «${field}» (${res.status}).`);
        return [field, decodeGrib2(new Uint8Array(await res.arrayBuffer()))] as const;
      }),
    );
    const rgb = packModel(Object.fromEntries(entries) as Record<Field, Grid>);
    return { png: encodePng(GRID_WIDTH, GRID_ROWS * 2, rgb), valid: new Date(run.cycle.getTime() + run.hour * HOUR) };
  }
  throw new Error('No hay ninguna pasada reciente del modelo publicada.');
}

/** De cuándo es la lluvia más reciente que tiene la NASA: lo dice la cabecera de una tesela pedida sin fecha. */
export async function rainTime(get: Fetch = fetch): Promise<Date> {
  const probe = await get(`${GIBS}/wmts/epsg4326/best/${RAIN_LAYER}/default/default/2km/0/0/0.png`, { method: 'HEAD' });
  const time = probe.headers.get('layer-time-actual');
  if (!probe.ok || !time || !isRainTime(time)) throw new Error('La NASA no ha dicho de cuándo es la lluvia.');
  return new Date(time);
}

/**
 * Una tesela de la lluvia de esa hora, tal cual la da la NASA (con su paleta y el fondo transparente).
 * El servicio que da el mundo en una sola imagen tarda de veinte segundos a dos minutos; las
 * teselas, tres décimas: por eso el mapa las pide una a una y las junta él.
 */
export async function rainTile(time: string, x: number, y: number, get: Fetch = fetch): Promise<Uint8Array<ArrayBuffer>> {
  const tile = await get(`${GIBS}/wmts/epsg4326/best/${RAIN_LAYER}/default/${time}/2km/${RAIN_LEVEL}/${y}/${x}.png`);
  if (!tile.ok || !tile.headers.get('content-type')?.startsWith('image/png')) throw new Error(`La NASA no ha dado la tesela de lluvia (${tile.status}).`);
  return new Uint8Array(await tile.arrayBuffer());
}
