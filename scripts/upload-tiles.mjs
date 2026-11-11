// Sube al Blob de Vercel las teselas de detalle del mapa (la foto de satélite y las luces nocturnas,
// de la NASA): las que scripts/download-tiles.mjs dejó en la carpeta teselas/, ya pasadas a WebP por
// scripts/convert-tiles.py. Así la aplicación las pide a nuestro propio almacén y no a un tercero.
//
// Almacén: «study-world-map-teselas» (público, Fráncfort), conectado al proyecto en Vercel. La clave
// de escritura, BLOB_READ_WRITE_TOKEN, se lee de .env.local (que no va al repositorio): no se
// imprime ni se copia a ningún otro sitio.
//
// Se ejecuta a mano:
//   node scripts/upload-tiles.mjs            todos los .webp de teselas/ que aún no estén subidos
//   node scripts/upload-tiles.mjs foto/3     solo lo que cuelga de esa carpeta
// Se puede interrumpir y volver a lanzar: primero pregunta al almacén qué tiene ya y solo sube lo
// que falta. Cada subida cuenta como una operación avanzada de Blob (ver los precios de Vercel).

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { list, put } from '@vercel/blob';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TILES = join(ROOT, 'teselas');
const PARALLEL = 10;
// Las teselas no cambian nunca: que el navegador y la red de distribución las guarden un año.
const YEAR = 365 * 24 * 3600;

function filesUnder(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesUnder(path));
    else if (entry.name.endsWith('.webp')) out.push(path);
  }
  return out;
}

async function uploaded(prefix) {
  const names = new Set();
  let cursor;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    for (const blob of page.blobs) names.add(blob.pathname);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return names;
}

async function main() {
  process.loadEnvFile(join(ROOT, '.env.local'));
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('Falta BLOB_READ_WRITE_TOKEN en .env.local');
  const only = process.argv[2] ?? '';
  const have = await uploaded(only);
  const jobs = filesUnder(join(TILES, only))
    .map((file) => ({ file, pathname: relative(TILES, file).replaceAll('\\', '/') }))
    .filter((job) => !have.has(job.pathname));
  console.log(`${have.size} ya subidas; ${jobs.length} por subir`);
  let [done, failed, next, base] = [0, 0, 0, ''];
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      for (let attempt = 1; ; attempt++) {
        try {
          const blob = await put(job.pathname, readFileSync(job.file), {
            access: 'public',
            addRandomSuffix: false,
            contentType: 'image/webp',
            cacheControlMaxAge: YEAR,
          });
          base ||= blob.url.slice(0, blob.url.length - job.pathname.length);
          break;
        } catch (error) {
          if (attempt >= 5) {
            failed++;
            console.error(`${job.pathname}: ${error.message}`);
            break;
          }
          // El servicio dice cuánto esperar cuando se le pide demasiado deprisa.
          await new Promise((r) => setTimeout(r, Math.max(error.retryAfter ?? 0, attempt * 2) * 1000));
        }
      }
      if (++done % 1000 === 0) console.log(`${done} de ${jobs.length}`);
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  console.log(`Hecho: ${jobs.length - failed} subidas, ${failed} con error${base ? `. Dirección pública del almacén: ${base}` : ''}`);
  if (failed) process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
