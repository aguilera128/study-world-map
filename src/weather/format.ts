// Cómo viaja el tiempo «de ahora» del servidor al mapa. Solo constantes y cuentas: lo cargan tanto
// la función de Vercel (api/tiempo.ts) como la aplicación, así que no puede importar nada más.
//
// El modelo va en una imagen PNG de 360 × 362 píxeles, un píxel por grado: la mitad de arriba lleva
// la temperatura en el rojo y el viento (hacia el este y hacia el norte) en el verde y el azul; la
// de abajo, la nubosidad en el rojo. Va en dos bloques y no en el canal alfa porque el navegador
// multiplica el color por el alfa al decodificar una imagen, y aquí los canales son datos.

/** Columnas: de 180° O a 179° E. */
export const GRID_WIDTH = 360;
/** Filas de cada bloque: de 90° N a 90° S. */
export const GRID_ROWS = 181;

/** Temperatura que cabe en un byte, en °C: por debajo o por encima se queda en el extremo. */
export const TEMP_MIN = -60;
export const TEMP_MAX = 60;
/** Componente del viento que cabe en un byte, en m/s (en valor absoluto). */
export const WIND_MAX = 32;

const byte = (x: number) => Math.max(0, Math.min(255, Math.round(x)));

export const tempToByte = (celsius: number) => byte(((celsius - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 255);
export const byteToTemp = (b: number) => TEMP_MIN + (b / 255) * (TEMP_MAX - TEMP_MIN);
/** El 128 es calma: así el cero se guarda exacto. */
export const windToByte = (ms: number) => byte(128 + (ms / WIND_MAX) * 127);
export const byteToWind = (b: number) => ((b - 128) / 127) * WIND_MAX;
export const cloudToByte = (percent: number) => byte((percent / 100) * 255);

/** Escala de la capa de temperatura: a cada temperatura (°C), su color. La usan el sombreador y la leyenda. */
export const TEMP_STOPS: readonly (readonly [celsius: number, color: string])[] = [
  [-40, '#6a3d9a'],
  [-20, '#3465a8'],
  [-10, '#5ea9d6'],
  [0, '#c9e8f2'],
  [10, '#86c26a'],
  [20, '#f3d74a'],
  [30, '#ee8a2f'],
  [40, '#c0302c'],
];

// La lluvia va aparte, en las teselas de la NASA (GIBS, rejilla «2km» en EPSG:4326): en el nivel 2
// cada tesela mide 512 píxeles y abarca 72°, así que el mundo son 5 × 3 teselas, de las que la
// última fila solo tiene dentro del mapa su mitad de arriba.
export const RAIN_LEVEL = 2;
export const RAIN_COLS = 5;
export const RAIN_ROWS = 3;
export const RAIN_TILE = 512;
/** El mundo entero, ya juntas las teselas: 2560 × 1280 píxeles (0,14° por píxel). */
export const RAIN_WIDTH = 2560;
export const RAIN_HEIGHT = 1280;

/** La hora de un dato de lluvia, como la escribe la NASA: «2026-11-12T13:30:00Z». */
export const isRainTime = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(value) && !Number.isNaN(Date.parse(value));

/** Qué se puede pedir a /api/tiempo. */
export type WeatherKind = 'modelo' | 'lluvia';
export const isWeatherKind = (value: unknown): value is WeatherKind => value === 'modelo' || value === 'lluvia';

/** Cabecera con la hora (UTC, ISO 8601) a la que corresponde el dato. */
export const VALID_HEADER = 'X-Tiempo-Valido';
