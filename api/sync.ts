import { neon } from '@neondatabase/serverless';

// Sincronización del progreso entre dispositivos, sin cuentas. Es la única función del proyecto.
//
//   POST /api/sync           { data }         → crea un código nuevo y guarda el progreso  → { code }
//   GET  /api/sync   (cabecera X-Sync-Code)    → { data, updatedAt }  (404 si el código no existe)
//        (también admite ?code=…, que usaban las versiones anteriores de la aplicación)
//   PUT  /api/sync           { code, data }    → guarda el progreso de ese código           → { updatedAt }
//   DELETE /api/sync         { code }          → borra lo guardado con ese código
//
// No se guarda ningún dato personal: una fila es un código al azar, el progreso (fichas de estudio)
// y dos fechas. Tampoco la dirección IP. Quien tiene el código puede leer y cambiar ese progreso:
// el código hace de contraseña, por eso es largo y lo genera el servidor.
//
// Contra el abuso, sin identificar a nadie: tamaño máximo por progreso, tope de códigos nuevos por
// hora en todo el servicio y borrado de lo que lleva un año sin usarse.
//
// Este fichero no hace nada al importarse (ver la regla de funciones de Vercel): la conexión se
// abre dentro de cada petición.

/** Sin letras ni cifras que se confundan al copiarlas a mano (0/O, 1/I/L, U/V). */
const ALPHABET = 'ABCDEFGHJKMNPQRSTWXYZ23456789';
const CODE_LENGTH = 12;
const CODE = new RegExp(`^[${ALPHABET}]{${CODE_LENGTH}}$`);
/** Un progreso completo (los tres mapas, todos los retos) ocupa bastante menos. */
const MAX_BYTES = 300_000;
const MAX_NEW_PER_HOUR = 400;
const KEEP_DAYS = 365;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const fail = (status: number, error: string) => json({ error }, status);

function newCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH * 2));
  let out = '';
  // Se descartan los valores que sesgarían el reparto entre las letras.
  const limit = 256 - (256 % ALPHABET.length);
  for (const byte of bytes) {
    if (byte < limit && out.length < CODE_LENGTH) out += ALPHABET[byte % ALPHABET.length];
  }
  return out.length === CODE_LENGTH ? out : newCode();
}

/** Acepta el código como lo escribe una persona: con guiones, espacios o en minúsculas. */
const cleanCode = (raw: unknown): string | null => {
  const code = String(raw ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return CODE.test(code) ? code : null;
};

/** El progreso que llega: un objeto JSON de tamaño razonable. Lo que contiene lo valida la web al leerlo. */
async function readBody(request: Request): Promise<{ code?: unknown; data?: unknown } | null> {
  const text = await request.text();
  if (text.length > MAX_BYTES) return null;
  try {
    const body = JSON.parse(text) as unknown;
    return body && typeof body === 'object' && !Array.isArray(body) ? (body as { code?: unknown; data?: unknown }) : null;
  } catch {
    return null;
  }
}

const isData = (data: unknown): data is Record<string, unknown> => !!data && typeof data === 'object' && !Array.isArray(data);

export default {
  async fetch(request: Request): Promise<Response> {
    const url = process.env.DATABASE_URL;
    if (!url) return fail(503, 'sin base de datos');
    const sql = neon(url);

    try {
      if (request.method === 'GET') {
        const code = cleanCode(request.headers.get('x-sync-code') ?? new URL(request.url).searchParams.get('code'));
        if (!code) return fail(400, 'código no válido');
        const rows = await sql`select data, updated_at from progress_sync where code = ${code}`;
        if (!rows.length) return fail(404, 'código desconocido');
        return json({ data: rows[0].data, updatedAt: rows[0].updated_at });
      }

      if (request.method === 'POST') {
        const body = await readBody(request);
        if (!body || !isData(body.data)) return fail(400, 'progreso no válido');
        // De paso, se borra lo que lleva un año sin usarse (antes del límite, para que se haga siempre).
        await sql`delete from progress_sync where updated_at < now() - make_interval(days => ${KEEP_DAYS})`;
        const recent = await sql`select count(*)::int as n from progress_sync where created_at > now() - interval '1 hour'`;
        if (recent[0].n >= MAX_NEW_PER_HOUR) return fail(429, 'demasiados códigos nuevos; prueba más tarde');
        const code = newCode();
        await sql`insert into progress_sync (code, data) values (${code}, ${JSON.stringify(body.data)}::jsonb)`;
        return json({ code }, 201);
      }

      if (request.method === 'PUT') {
        const body = await readBody(request);
        const code = cleanCode(body?.code);
        if (!body || !code || !isData(body.data)) return fail(400, 'petición no válida');
        const rows = await sql`update progress_sync set data = ${JSON.stringify(body.data)}::jsonb, updated_at = now() where code = ${code} returning updated_at`;
        if (!rows.length) return fail(404, 'código desconocido');
        return json({ updatedAt: rows[0].updated_at });
      }

      if (request.method === 'DELETE') {
        const code = cleanCode((await readBody(request))?.code);
        if (!code) return fail(400, 'código no válido');
        await sql`delete from progress_sync where code = ${code}`;
        return json({ deleted: true });
      }

      return fail(405, 'método no permitido');
    } catch (error) {
      console.error('sync', error instanceof Error ? error.message : 'error');
      return fail(500, 'error del servidor');
    }
  },
};
