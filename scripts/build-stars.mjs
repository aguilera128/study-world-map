// Recorta el catálogo Yale Bright Star (BSC5, dominio público) a las estrellas que dibuja el mapa.
// Solo hace falta volver a ejecutarlo para cambiar el corte de magnitud:
//   1. descargar y descomprimir http://tdc-www.harvard.edu/catalogs/bsc5.dat.gz
//   2. node scripts/build-stars.mjs ruta/a/bsc5.dat
// La salida, src/engine/stars.ts, sí se versiona (el catálogo no).

import { readFileSync, writeFileSync } from 'node:fs';

const MAX_MAG = 6.5;
const file = process.argv[2];
if (!file) throw new Error('Uso: node scripts/build-stars.mjs ruta/a/bsc5.dat');

const stars = [];
for (const line of readFileSync(file, 'latin1').split('\n')) {
  // Columnas del formato BSC5 (posiciones J2000): AR 76-83 (hhmmss.s), Dec 84-90 (±ddmmss), V 103-107, B−V 110-114.
  const ra = line.slice(75, 83);
  const mag = parseFloat(line.slice(102, 107));
  if (!ra.trim() || !(mag <= MAX_MAG)) continue; // sin posición: objetos retirados del catálogo
  const raDeg = (+ra.slice(0, 2) + +ra.slice(2, 4) / 60 + +ra.slice(4) / 3600) * 15;
  const dec = line.slice(83, 90);
  const decDeg = (dec[0] === '-' ? -1 : 1) * (+dec.slice(1, 3) + +dec.slice(3, 5) / 60 + +dec.slice(5, 7) / 3600);
  const bv = parseFloat(line.slice(109, 114));
  stars.push([Math.round(raDeg * 100), Math.round(decDeg * 100), Math.round(mag * 10), Math.round((Number.isFinite(bv) ? bv : 0.6) * 10)]);
}
stars.sort((a, b) => a[2] - b[2]);

writeFileSync(
  'src/engine/stars.ts',
  `// GENERADO por scripts/build-stars.mjs: no editar a mano.
// ${stars.length} estrellas de magnitud ≤ ${MAX_MAG} del catálogo Yale Bright Star (BSC5, dominio público),
// de más a menos brillante. Cuatro enteros por estrella: ascensión recta y declinación J2000 en
// centésimas de grado, magnitud visual ×10 e índice de color B−V ×10.
export const STARS: readonly number[] = [
${stars.map((s) => s.join(',')).join(',\n')},
];
`,
);
console.log(`${stars.length} estrellas (mag ≤ ${MAX_MAG})`);
