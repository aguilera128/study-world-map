#!/usr/bin/env node
// Crea las tablas de la base de datos (Neon): la del progreso sincronizado y la del ranking. Se
// puede repetir sin riesgo: no borra ni cambia nada que ya exista.
//
//   node scripts/db-init.mjs
//
// Lee DATABASE_URL_UNPOOLED (o DATABASE_URL) de .env.local, que no va al repositorio.
// Con --probar, además, pasa las funciones api/sync.ts y api/ranking.ts por un ciclo completo con
// datos de prueba y borra esas filas al terminar.

import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

async function main() {
  if (existsSync('.env.local')) process.loadEnvFile('.env.local');
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) throw new Error('Falta DATABASE_URL en .env.local');
  const sql = neon(url);

  await sql`
    create table if not exists progress_sync (
      code text primary key,
      data jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )`;
  await sql`create index if not exists progress_sync_created_at on progress_sync (created_at)`;
  await sql`create index if not exists progress_sync_updated_at on progress_sync (updated_at)`;
  const [{ n }] = await sql`select count(*)::int as n from progress_sync`;
  console.log(`tabla progress_sync lista · ${n} filas`);

  // Ranking: los diez mejores resultados de cada categoría (api/ranking.ts).
  await sql`
    create table if not exists ranking (
      id bigint generated always as identity primary key,
      category text not null,
      nick text not null,
      country text,
      grade double precision not null,
      ms integer not null,
      created_at timestamptz not null default now()
    )`;
  await sql`create index if not exists ranking_top on ranking (category, grade desc, ms, created_at)`;
  await sql`create index if not exists ranking_created_at on ranking (created_at)`;
  const [{ n: ranked }] = await sql`select count(*)::int as n from ranking`;
  console.log(`tabla ranking lista · ${ranked} filas`);

  if (!process.argv.includes('--probar')) return;
  const { default: handler } = await import('../api/sync.ts');
  const call = async (method, path, body) => {
    const res = await handler.fetch(new Request(`http://local${path}`, { method, body: body && JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }));
    return { status: res.status, body: await res.json() };
  };
  const canon = (v) => (v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
  const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
  const first = { progress: { ESP: { locate: { box: 3, seen: 1, right: 1, last: 1 } } } };
  const created = await call('POST', '/api/sync', { data: first });
  const code = created.body.code;
  const checks = [
    ['crear', created.status === 201 && /^[A-Z0-9]{12}$/.test(code)],
    // jsonb no conserva el orden de las claves: se compara el contenido
    ['leer', same((await call('GET', `/api/sync?code=${code}`)).body.data, first)],
    ['leer con guiones y minúsculas', (await call('GET', `/api/sync?code=${code.toLowerCase().replace(/(.{4})/g, '$1-')}`)).status === 200],
    ['guardar', (await call('PUT', '/api/sync', { code, data: { progress: {} } })).status === 200],
    ['leer lo guardado', JSON.stringify((await call('GET', `/api/sync?code=${code}`)).body.data) === '{"progress":{}}'],
    ['código desconocido', (await call('GET', '/api/sync?code=AAAAAAAAAAAA')).status === 404],
    ['código mal escrito', (await call('GET', '/api/sync?code=abc')).status === 400],
    ['guardar sin código', (await call('PUT', '/api/sync', { data: {} })).status === 400],
    ['progreso que no es un objeto', (await call('POST', '/api/sync', { data: 'x' })).status === 400],
    ['progreso demasiado grande', (await call('POST', '/api/sync', { data: { x: 'a'.repeat(400_000) } })).status === 400],
    ['método no permitido', (await call('PATCH', '/api/sync')).status === 405],
    ['borrar', (await call('DELETE', '/api/sync', { code })).status === 200 && (await call('GET', `/api/sync?code=${code}`)).status === 404],
  ];
  await sql`delete from progress_sync where code = ${code}`;
  for (const [name, ok] of checks) console.log(ok ? '  bien ' : '  MAL  ', name);
  if (checks.some(([, ok]) => !ok)) process.exitCode = 1;

  // El ranking, en una categoría poco jugada y con apodos de prueba que se borran al final.
  const { default: ranking } = await import('../api/ranking.ts');
  const category = 'fisico/name/type/fisico-tierras/all';
  const rank = async (method, body, headers = {}) => {
    const path = method === 'GET' ? `/api/ranking?c=${encodeURIComponent(body)}` : '/api/ranking';
    const res = await ranking.fetch(new Request(`http://local${path}`, { method, body: method === 'GET' ? undefined : JSON.stringify(body), headers }));
    return { status: res.status, cache: res.headers.get('cache-control'), body: await res.json() };
  };
  const entry = (extra) => ({ category, nick: 'Prueba uno', grade: 10, ms: 60_000, total: 10, ...extra });
  const rowOf = (res, nick) => res.body.top?.find((r) => r.nick === nick);
  await sql`delete from ranking where nick like 'Prueba %'`;
  const posted = await rank('POST', entry(), { 'x-vercel-ip-country': 'ES' });
  const worse = await rank('POST', entry({ ms: 90_000 }));
  const better = await rank('POST', entry({ ms: 30_000 }));
  const other = await rank('POST', entry({ nick: 'Prueba dos', grade: 9.5 }));
  const read = await rank('GET', category);
  const rankChecks = [
    ['publicar', posted.status === 201 && posted.body.entered === true],
    ['el país sale de la cabecera, en minúsculas', rowOf(posted, 'Prueba uno')?.country === 'es'],
    ['un resultado peor del mismo apodo no entra', worse.status === 200 && worse.body.entered === false],
    ['uno mejor sustituye al anterior', better.status === 201 && better.body.top.filter((r) => r.nick === 'Prueba uno').length === 1 && rowOf(better, 'Prueba uno')?.ms === 30_000],
    ['sin cabecera de país, sin bandera', rowOf(other, 'Prueba dos')?.country === null],
    ['leer, ordenado y con caché', read.status === 200 && /s-maxage=60/.test(read.cache) && read.body.top.findIndex((r) => r.nick === 'Prueba uno') < read.body.top.findIndex((r) => r.nick === 'Prueba dos')],
    ['como mucho diez', read.body.top.length <= 10],
    ['resumen de todos los rankings', await (async () => {
      const res = await ranking.fetch(new Request('http://local/api/ranking'));
      const board = (await res.json()).boards?.find((b) => b.category === category);
      return res.status === 200 && board?.count === 2 && board.best.nick === 'Prueba uno';
    })()],
    ['apodo no válido', (await rank('POST', entry({ nick: 'ana@correo.es' }))).status === 422],
    ['categoría desconocida', (await rank('POST', entry({ category: 'world/locate/map/marte/10' }))).status === 400 && (await rank('GET', 'x')).status === 400],
    ['resultado imposible', (await rank('POST', entry({ ms: 2_000 }))).status === 400 && (await rank('POST', entry({ grade: 9.3 }))).status === 400],
    ['petición que no es JSON', (await ranking.fetch(new Request('http://local/api/ranking', { method: 'POST', body: 'hola' }))).status === 400],
    ['método no permitido', (await rank('DELETE', {})).status === 405],
  ];
  await sql`delete from ranking where nick like 'Prueba %'`;
  for (const [name, ok] of rankChecks) console.log(ok ? '  bien ' : '  MAL  ', name);
  if (rankChecks.some(([, ok]) => !ok)) process.exitCode = 1;
}

// Solo al ejecutarlo directamente, nunca al importarlo.
if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
