import { CELESTRAK_GROUPS, isSatGroup, SAT_REFRESH_HOURS, toRow, type SatPayload, type SatRow } from '../src/satellites/format.ts';

// Los satélites de la capa «Satélites»: los elementos orbitales GP de CelesTrak de un grupo, en
// filas compactas (src/satellites/format.ts). La posición de cada uno la calcula el navegador.
//
//   GET /api/satelites?grupo=<estaciones|navegacion|meteorologicos|starlink>  → SatPayload (JSON)
//
// Como /api/tiempo: quien mira el mapa no habla con CelesTrak (ni su IP sale de aquí) y la política
// de contenido no se abre. Solo se piden los grupos de la lista: no es un intermediario para
// cualquier dirección. La respuesta se guarda seis horas en la red de Vercel: CelesTrak renueva los
// datos cada dos horas y pide no descargarlos más de una vez por renovación
// (https://celestrak.org/usage-policy.php).
//
// No guarda ni anota nada de quien pregunta, y no hace nada al importarse (ver la regla de
// funciones de Vercel en AGENTS.md).

const HOUR = 3600;
const CACHE = `public, max-age=${HOUR}, s-maxage=${SAT_REFRESH_HOURS * HOUR}, stale-while-revalidate=${6 * HOUR}, stale-if-error=${24 * HOUR}`;
/** Si CelesTrak contesta con un error, no se le vuelve a preguntar en este rato: así lo pide su política. */
const PAUSE_MS = 30 * 60_000;
let pausedUntil = 0;

const json = (body: unknown, status: number, cache: string) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache } });
// Un fallo también se guarda un rato en la red de Vercel, para no repetir la pregunta en cada visita.
const fail = (status: number, error: string) => json({ error }, status, status === 502 ? 'public, s-maxage=600' : 'no-store');

async function fetchGroup(group: string): Promise<SatRow[]> {
  const res = await fetch(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`, { signal: AbortSignal.timeout(25_000) });
  if (!res.ok) {
    pausedUntil = Date.now() + PAUSE_MS;
    throw new Error(`CelesTrak ${group}: ${res.status}`);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error(`CelesTrak ${group}: respuesta sin lista`);
  return data.map((omm) => (omm && typeof omm === 'object' ? toRow(omm as Record<string, unknown>) : null)).filter((row): row is SatRow => row !== null);
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') return fail(405, 'Método no permitido.');
    const group = new URL(request.url).searchParams.get('grupo');
    if (!isSatGroup(group)) return fail(400, 'Falta «grupo»: estaciones, navegacion, meteorologicos o starlink.');
    if (Date.now() < pausedUntil) return fail(502, 'No se han podido obtener los satélites.');
    try {
      const fetched = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
      const lists = await Promise.all(CELESTRAK_GROUPS[group].map(fetchGroup));
      const payload: SatPayload = { fetched, sats: lists.flat() };
      return json(payload, 200, CACHE);
    } catch (e) {
      // El motivo va al registro de la función; a quien pregunta solo se le dice que no hay dato.
      console.error('satelites:', e instanceof Error ? e.message : e);
      return fail(502, 'No se han podido obtener los satélites.');
    }
  },
};
