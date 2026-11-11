// Descarga las teselas de detalle del mapa (la foto de satélite y las luces nocturnas) del servicio
// GIBS de la NASA a la carpeta teselas/ del proyecto, que NO va al repositorio (.gitignore): son los
// originales, que scripts/convert-tiles.py pasa a WebP y scripts/upload-tiles.mjs sube al Blob de
// Vercel, y se guardan por si hace falta volver a convertirlos.
//
// Fuentes (dominio público):
//   foto   Blue Marble Next Generation (NASA Earth Observatory), capa «BlueMarble_NextGeneration»
//   luces  Black Marble 2016 (NASA), capa «VIIRS_Night_Lights», fecha 2016-01-01
// Rejilla «500m» de GIBS en longitud/latitud: en el nivel n cada tesela mide 512 píxeles y cubre
// 288°/2ⁿ, desde la esquina (180° O, 90° N). Niveles 0 a 7: 17 073 teselas por capa.
//
// Se ejecuta a mano:
//   node scripts/download-tiles.mjs            las dos capas enteras (media hora larga, del orden de 1 GB)
//   node scripts/download-tiles.mjs foto 0 5   solo una capa y un tramo de niveles
// Se puede interrumpir y volver a lanzar: lo que ya está descargado no se pide otra vez.

import { mkdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'teselas');
const GIBS = 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best';
export const LAYERS = {
  foto: { url: `${GIBS}/BlueMarble_NextGeneration/default/500m`, ext: 'jpeg' },
  luces: { url: `${GIBS}/VIIRS_Night_Lights/default/2016-01-01/500m`, ext: 'png' },
};
export const MAX_LEVEL = 7;
const SPAN = 288;
const PARALLEL = 8; // peticiones a la vez: suficiente para ir rápido sin cargar el servicio

/** Todas las teselas de un nivel: [fila, columna]. */
export function tilesOf(level) {
  const span = SPAN / 2 ** level;
  const [cols, rows] = [Math.ceil(360 / span), Math.ceil(180 / span)];
  const tiles = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) tiles.push([r, c]);
  return tiles;
}

async function download(url, file) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 404 || res.status === 400) return 'falta'; // fuera de la rejilla
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = Buffer.from(await res.arrayBuffer());
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, data);
      return data.length;
    } catch (error) {
      if (attempt >= 4) throw new Error(`${url}: ${error.message}`);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

async function main() {
  const [only, from = '0', to = String(MAX_LEVEL)] = process.argv.slice(2);
  const names = only ? [only] : Object.keys(LAYERS);
  const jobs = [];
  for (const name of names) {
    const layer = LAYERS[name];
    if (!layer) throw new Error(`Capa desconocida: ${name} (hay ${Object.keys(LAYERS).join(', ')})`);
    for (let level = +from; level <= +to; level++) {
      for (const [r, c] of tilesOf(level)) {
        jobs.push({ url: `${layer.url}/${level}/${r}/${c}.${layer.ext}`, file: join(OUT, name, String(level), String(r), `${c}.${layer.ext}`) });
      }
    }
  }
  let [done, fetched, bytes, missing, failed] = [0, 0, 0, 0, 0];
  let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      try {
        if (existsSync(job.file) && statSync(job.file).size > 0) {
          bytes += statSync(job.file).size;
        } else {
          const size = await download(job.url, job.file);
          if (size === 'falta') missing++;
          else {
            fetched++;
            bytes += size;
          }
        }
      } catch (error) {
        failed++;
        console.error(error.message);
      }
      if (++done % 1000 === 0) console.log(`${done} de ${jobs.length} · ${(bytes / 1e6).toFixed(0)} MB`);
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  console.log(`Hecho: ${jobs.length} teselas, ${fetched} descargadas ahora, ${missing} fuera de la rejilla, ${failed} con error, ${(bytes / 1e6).toFixed(0)} MB en ${OUT}`);
  if (failed) process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
