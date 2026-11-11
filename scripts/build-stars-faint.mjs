// Genera public/data/stars.bin: las estrellas débiles del cielo, las que no llegan a verse una a una
// pero dan al fondo su aspecto de cielo de verdad. Las brillantes (magnitud ≤ 6,5) siguen saliendo
// del catálogo Yale (scripts/build-stars.mjs → src/engine/stars.ts) y van dentro de la aplicación;
// estas son muchas más y se piden aparte, cuando el cielo está a la vista.
//
// Fuente: catálogo Hipparcos (ESA, 1997; Perryman et al., «The Hipparcos and Tycho Catalogues», ESA
// SP-1200), 118 218 estrellas, completo hasta magnitud 7,3–9 según la zona del cielo. Uso libre
// citando la fuente. Se toma la copia del HEASARC de la NASA:
//   1. descargar https://heasarc.gsfc.nasa.gov/FTP/heasarc/dbase/tdat_files/heasarc_hipparcos.tdat.gz (15 MB)
//   2. node scripts/build-stars-faint.mjs ruta/a/heasarc_hipparcos.tdat.gz
// La salida sí se versiona (el catálogo no).
//
// Formato de stars.bin (enteros de poco peso, en bloques para que se comprima bien), con las
// estrellas de más a menos brillante:
//   uint32            n, número de estrellas
//   uint16 × n        ascensión recta: 0…65535 = 0…360°
//   uint16 × n        declinación:     0…65535 = −90…+90°
//   int8 × n          magnitud visual × 10
//   int8 × n          índice de color B−V × 10
// Las posiciones son ICRS en la época del catálogo (J1991,25): a esta escala, las mismas que J2000.

import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const MIN_MAG = 6.5; // hasta aquí llegan las del catálogo Yale
const MAX_MAG = 9.0;
const OUT = 'public/data/stars.bin';

function main() {
  const file = process.argv[2];
  if (!file) throw new Error('Uso: node scripts/build-stars-faint.mjs ruta/a/heasarc_hipparcos.tdat.gz');
  const lines = gunzipSync(readFileSync(file)).toString('latin1').split('\n');
  // La cabecera dice en qué orden van los campos de cada fila: line[1] = name ra dec …
  const fields = lines
    .filter((l) => /^line\[\d+\] = /.test(l))
    .flatMap((l) => l.replace(/^line\[\d+\] = /, '').trim().split(/\s+/));
  const at = (name) => {
    const i = fields.indexOf(name);
    if (i < 0) throw new Error(`El catálogo no trae el campo «${name}»`);
    return i;
  };
  const [RA, DEC, MAG, BV] = [at('ra'), at('dec'), at('vmag'), at('bv_color')];

  const stars = [];
  for (const line of lines.slice(lines.indexOf('<DATA>') + 1)) {
    if (!line || line.startsWith('<')) continue;
    const row = line.split('|');
    const [ra, dec, mag] = [parseFloat(row[RA]), parseFloat(row[DEC]), parseFloat(row[MAG])];
    // Sin posición (263 entradas del catálogo no la tienen) o fuera del corte de brillo.
    if (!Number.isFinite(ra) || !Number.isFinite(dec) || !(mag > MIN_MAG && mag <= MAX_MAG)) continue;
    const bv = parseFloat(row[BV]);
    stars.push({ ra, dec, mag, bv: Number.isFinite(bv) ? bv : 0.6 });
  }
  stars.sort((a, b) => a.mag - b.mag);

  const n = stars.length;
  const out = Buffer.alloc(4 + n * 6);
  out.writeUInt32LE(n, 0);
  stars.forEach((s, i) => {
    out.writeUInt16LE(Math.min(65535, Math.round((s.ra / 360) * 65536) % 65536), 4 + 2 * i);
    out.writeUInt16LE(Math.round(((s.dec + 90) / 180) * 65535), 4 + 2 * n + 2 * i);
    out.writeInt8(Math.round(s.mag * 10), 4 + 4 * n + i);
    out.writeInt8(Math.max(-128, Math.min(127, Math.round(s.bv * 10))), 4 + 5 * n + i);
  });
  writeFileSync(OUT, out);
  console.log(`${OUT}: ${n} estrellas (${MIN_MAG} < mag ≤ ${MAX_MAG}), ${(out.length / 1024).toFixed(0)} KB`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
