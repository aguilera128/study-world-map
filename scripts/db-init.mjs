#!/usr/bin/env node
// Crea la tabla del progreso sincronizado en la base de datos (Neon). Se puede repetir sin riesgo:
// no borra ni cambia nada que ya exista.
//
//   node scripts/db-init.mjs
//
// Lee DATABASE_URL_UNPOOLED (o DATABASE_URL) de .env.local, que no va al repositorio.
// Con --probar, además, pasa la función api/sync.ts por un ciclo completo (crear, leer, guardar,
// leer) con un progreso de prueba y borra esa fila al terminar.

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
}

// Solo al ejecutarlo directamente, nunca al importarlo.
if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
