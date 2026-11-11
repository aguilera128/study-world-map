import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { cleanNick, compare, isCategory, plausible, qualifies, TOP, type RankRow } from '../src/game/ranking.ts';

// Ranking de resultados: los diez mejores de cada categoría (mapa, reto, forma de responder, zona y
// número de preguntas), sin cuentas.
//
//   GET  /api/ranking?c=<categoría>                       → { top }
//   POST /api/ranking  { category, nick, grade, ms, total } → { entered, top }   (201 si entra)
//
// Qué se guarda de cada resultado: la categoría, el apodo que escribe quien juega, el país desde el
// que se publica, la nota, el tiempo y la fecha. El país sale de la cabecera que añade Vercel a la
// petición («x-vercel-ip-country»): la dirección IP ni se guarda ni se anota en los registros.
// No hay nada que identifique a quien juega: un apodo lo puede usar cualquiera.
//
// La nota la calcula el navegador, así que no se puede garantizar que sea de una partida real. Se
// rechaza lo imposible (ver «plausible») y se limita cuánto se puede publicar por hora en todo el
// servicio. Solo se conservan los diez mejores de cada categoría: la tabla no crece.
//
// La lectura se guarda un minuto en la red de Vercel, para no despertar la base de datos en cada
// pantalla de resultados. Por eso su respuesta no lleva nada que dependa de quien pregunta.
//
// Este fichero no hace nada al importarse (ver la regla de funciones de Vercel): la conexión se
// abre dentro de cada petición.

const MAX_BYTES = 2_000;
/** Resultados publicados por hora en todo el servicio. */
const MAX_PER_HOUR = 600;
/** Los rankings del reto del día se borran pasado este tiempo. */
const KEEP_DAILY_DAYS = 45;

const json = (body: unknown, status = 200, cache = 'no-store') =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache } });
const fail = (status: number, error: string) => json({ error }, status);

type Sql = NeonQueryFunction<false, false>;

async function topOf(sql: Sql, category: string): Promise<RankRow[]> {
  const rows = (await sql`
    select nick, country, grade, ms, created_at from ranking
    where category = ${category} order by grade desc, ms asc, created_at asc limit ${TOP}`) as Record<string, unknown>[];
  return rows.map((r) => ({ nick: String(r.nick), country: r.country ? String(r.country) : null, grade: Number(r.grade), ms: Number(r.ms), at: new Date(r.created_at as string).toISOString() }));
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = process.env.DATABASE_URL;
    if (!url) return fail(503, 'sin base de datos');
    const sql = neon(url);

    try {
      if (request.method === 'GET') {
        const category = new URL(request.url).searchParams.get('c') ?? '';
        if (!isCategory(category)) return fail(400, 'categoría no válida');
        return json({ top: await topOf(sql, category) }, 200, 'public, max-age=0, s-maxage=60');
      }

      if (request.method === 'POST') {
        const text = await request.text();
        if (text.length > MAX_BYTES) return fail(400, 'petición no válida');
        let body: Record<string, unknown>;
        try {
          body = JSON.parse(text) as Record<string, unknown>;
        } catch {
          return fail(400, 'petición no válida');
        }
        if (!body || typeof body !== 'object') return fail(400, 'petición no válida');
        const category = typeof body.category === 'string' ? body.category : '';
        if (!isCategory(category)) return fail(400, 'categoría no válida');
        const nick = cleanNick(body.nick);
        if (!nick) return fail(422, 'apodo no válido');
        const result = { grade: body.grade as number, ms: body.ms as number, total: body.total as number };
        if (!plausible(result)) return fail(400, 'resultado no válido');
        // El reto del día siempre tiene diez preguntas.
        if (category.startsWith('dia/') && result.total !== 10) return fail(400, 'resultado no válido');

        const top = await topOf(sql, category);
        // Un apodo sale una vez por categoría, con su mejor resultado.
        const mine = top.find((row) => row.nick.toLowerCase() === nick.toLowerCase());
        if ((mine && compare(result, mine) >= 0) || !qualifies(result, top)) return json({ entered: false, top });

        const recent = (await sql`select count(*)::int as n from ranking where created_at > now() - interval '1 hour'`) as { n: number }[];
        if (recent[0].n >= MAX_PER_HOUR) return fail(429, 'demasiados resultados; prueba más tarde');

        // Dos letras, o nada: lo que mande la cabecera no se guarda sin mirar.
        const header = request.headers.get('x-vercel-ip-country') ?? '';
        const country = /^[A-Za-z]{2}$/.test(header) ? header.toLowerCase() : null;

        if (mine) await sql`delete from ranking where category = ${category} and lower(nick) = ${nick.toLowerCase()}`;
        await sql`insert into ranking (category, nick, country, grade, ms) values (${category}, ${nick}, ${country}, ${result.grade}, ${result.ms})`;
        // Fuera lo que ya no está entre los mejores y, de paso, los retos del día antiguos.
        await sql`
          delete from ranking where category = ${category} and id not in (
            select id from ranking where category = ${category} order by grade desc, ms asc, created_at asc limit ${TOP})`;
        await sql`delete from ranking where category like 'dia/%' and created_at < now() - make_interval(days => ${KEEP_DAILY_DAYS})`;
        return json({ entered: true, top: await topOf(sql, category) }, 201);
      }

      return fail(405, 'método no permitido');
    } catch (error) {
      console.error('ranking', error instanceof Error ? error.message : 'error');
      return fail(500, 'error del servidor');
    }
  },
};
