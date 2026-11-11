#!/usr/bin/env node
// Moderación del ranking: ver lo publicado y borrar una entrada (un apodo ofensivo, un nombre real,
// un resultado trucado). Se ejecuta a mano.
//
//   node scripts/ranking.mjs                    las últimas 50 entradas publicadas
//   node scripts/ranking.mjs world/locate/map/europa/10    el ranking de esa categoría
//   node scripts/ranking.mjs --apodo texto      las entradas cuyo apodo contiene ese texto
//   node scripts/ranking.mjs --borrar 123       borra la entrada con ese número (no se puede deshacer)
//
// Lee DATABASE_URL_UNPOOLED (o DATABASE_URL) de .env.local, que no va al repositorio.

import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

async function main() {
  if (existsSync('.env.local')) process.loadEnvFile('.env.local');
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) throw new Error('Falta DATABASE_URL en .env.local');
  const sql = neon(url);
  const [first, second] = process.argv.slice(2);

  if (first === '--borrar') {
    if (!/^\d+$/.test(second ?? '')) throw new Error('Falta el número de la entrada: --borrar 123');
    const gone = await sql`delete from ranking where id = ${second} returning category, nick`;
    console.log(gone.length ? `borrada: ${gone[0].nick} · ${gone[0].category}` : 'no hay ninguna entrada con ese número');
    return;
  }

  const rows =
    first === '--apodo'
      ? await sql`select * from ranking where nick ilike ${`%${second ?? ''}%`} order by created_at desc limit 200`
      : first
        ? await sql`select * from ranking where category = ${first} order by grade desc, ms, created_at`
        : await sql`select * from ranking order by created_at desc limit 50`;
  for (const r of rows) {
    const time = `${Math.floor(r.ms / 60_000)}:${String(Math.round(r.ms / 1000) % 60).padStart(2, '0')}`;
    console.log(`${String(r.id).padStart(6)}  ${new Date(r.created_at).toISOString().slice(0, 16)}  ${r.country ?? '--'}  ${Number(r.grade).toFixed(1).padStart(4)}  ${time.padStart(6)}  ${r.nick.padEnd(16)}  ${r.category}`);
  }
  console.log(`${rows.length} entradas`);
}

// Solo al ejecutarlo directamente, nunca al importarlo.
if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
