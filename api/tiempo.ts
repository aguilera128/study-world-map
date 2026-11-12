import { isRainTime, isWeatherKind, RAIN_COLS, RAIN_ROWS, VALID_HEADER } from '../src/weather/format.ts';
import { fetchModel, rainTile, rainTime } from '../src/weather/model.ts';

// El tiempo «de ahora» para las capas del mapa: temperatura, viento y nubes según el modelo GFS de
// la NOAA, y la lluvia que ha medido el satélite GPM de la NASA.
//
//   GET /api/tiempo?capa=modelo                    → imagen PNG con temperatura, viento y nubosidad
//                                                    (src/weather/format.ts); en la cabecera
//                                                    «X-Tiempo-Valido», la hora a la que corresponde
//   GET /api/tiempo?capa=lluvia                    → { valid }: de cuándo es la última lluvia medida
//   GET /api/tiempo?capa=lluvia&t=<hora>&x=&y=     → una tesela PNG de la lluvia de esa hora
//
// Por qué pasa por aquí y no lo pide el navegador a la NOAA y a la NASA: así quien mira el mapa no
// habla con ningún tercero (ni su dirección IP sale de este servicio), y la política de contenido
// de la web no tiene que abrirse a nadie. Las respuestas se guardan en la red de Vercel (son iguales
// para todo el mundo): la función solo se despierta unas pocas veces por hora por muchas visitas
// que haya, y a las fuentes les llega una petición nuestra de vez en cuando.
//
// No guarda ni anota nada de quien pregunta, y no hace nada al importarse (ver la regla de
// funciones de Vercel en AGENTS.md).

/** Media hora en la red de Vercel y diez minutos en el navegador; si la fuente falla, vale lo anterior un rato más. */
const FRESH = 'public, max-age=600, s-maxage=1800, stale-while-revalidate=7200, stale-if-error=21600';
/** La tesela de una hora concreta ya no cambia. */
const FIXED = 'public, max-age=86400, s-maxage=86400';

const json = (body: unknown, status: number, cache: string) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache } });
const fail = (status: number, error: string) => json({ error }, status, 'no-store');
const png = (bytes: Uint8Array<ArrayBuffer>, cache: string, valid: string) =>
  new Response(bytes, { headers: { 'Content-Type': 'image/png', 'Content-Length': String(bytes.length), 'Cache-Control': cache, [VALID_HEADER]: valid } });

/** Índice de tesela válido: un entero de 0 a `count − 1`. */
const tileIndex = (value: string | null, count: number): number | null => (value !== null && /^\d$/.test(value) && Number(value) < count ? Number(value) : null);

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') return fail(405, 'Método no permitido.');
    const params = new URL(request.url).searchParams;
    const kind = params.get('capa');
    if (!isWeatherKind(kind)) return fail(400, 'Falta «capa»: modelo o lluvia.');
    try {
      if (kind === 'modelo') {
        const model = await fetchModel(Date.now());
        return png(model.png, FRESH, model.valid.toISOString());
      }
      const time = params.get('t');
      if (time === null) return json({ valid: (await rainTime()).toISOString().replace('.000Z', 'Z') }, 200, FRESH);
      // Solo se piden a la NASA teselas que existen: esto no es un intermediario para cualquier dirección.
      const x = tileIndex(params.get('x'), RAIN_COLS);
      const y = tileIndex(params.get('y'), RAIN_ROWS);
      if (!isRainTime(time) || x === null || y === null) return fail(400, 'Tesela de lluvia no válida.');
      return png(await rainTile(time, x, y), FIXED, time);
    } catch (e) {
      // El motivo va al registro de la función; a quien pregunta solo se le dice que no hay dato.
      console.error('tiempo:', e instanceof Error ? e.message : e);
      return fail(502, 'No se ha podido obtener el tiempo de ahora.');
    }
  },
};
