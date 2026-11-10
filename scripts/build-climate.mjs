// Calcula qué climas hay en cada país, y en qué proporción de su territorio, a partir del mapa
// mundial de Köppen-Geiger (Kottek, Grieser, Beck, Rudolf y Rubel, 2006: «World Map of the
// Köppen-Geiger climate classification updated», Meteorologische Zeitschrift 15, 259-263).
// Solo hace falta volver a ejecutarlo si cambian las fronteras o la agrupación de climas:
//   1. descargar y descomprimir https://koeppen-geiger.vu-wien.ac.at/data/Koeppen-Geiger-ASCII.zip
//   2. pnpm atlas   (este script lee public/data/atlas.json)
//   3. node scripts/build-climate.mjs ruta/a/Koeppen-Geiger-ASCII.txt
// La salida, scripts/data/climas.koppen.json, sí se versiona (la rejilla no). Qué climas se enseñan
// de cada país lo decide scripts/build-atlas.mjs, con las correcciones de scripts/data/climas.mjs.
//
// La rejilla tiene una celda cada medio grado. Los 31 tipos de Köppen se agrupan en los climas que
// se estudian en la ESO; los países tan pequeños que no contienen el centro de ninguna celda toman
// el clima de la celda más cercana.

import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) throw new Error('Uso: node scripts/build-climate.mjs ruta/a/Koeppen-Geiger-ASCII.txt');

/**
 * Tipo de Köppen de una celda → clima escolar. Köppen clasifica solo con temperatura y lluvia, y
 * en varios sitios no coincide con el mapa de climas de los libros de texto; la posición de la
 * celda corrige esos casos:
 */
export function escolar(cls, lat, lon) {
  const tropico = Math.abs(lat) <= 23.5;
  const europa = lon >= -11 && lon <= 40 && lat >= 35 && lat <= 62;
  // Sin estación seca (Af): ecuatorial cerca del ecuador; más lejos (Caribe, costa de Brasil,
  // Madagascar, Pacífico sur) es el tropical lluvioso de los alisios.
  if (cls === 'Af') return Math.abs(lat) <= 12 ? 'ecuatorial' : 'tropical';
  // Monzónico (Am): junto al ecuador equivale al ecuatorial (golfo de Guinea, Amazonia); en Asia es
  // el tropical monzónico.
  if (cls === 'Am') return Math.abs(lat) <= 10 ? 'ecuatorial' : 'tropical';
  if (cls[0] === 'A') return 'tropical';
  if (cls.startsWith('BW')) return 'desertico';
  if (cls.startsWith('BS')) return 'semiarido';
  // Verano seco (Cs): mediterráneo, salvo en Irán y Asia central, donde es la estepa de inviernos fríos.
  // Tampoco por debajo de los 29° de latitud: ahí el verano seco de Köppen solo sale en sierras y
  // altiplanos (Sierra Madre Occidental de México, Andes, Etiopía), que los libros dan como clima
  // de montaña. El mediterráneo de verdad está entre los 30° y los 45°, en las fachadas oeste.
  if (cls.startsWith('Cs')) return lon > 45 && lon < 100 ? 'semiarido' : Math.abs(lat) < 29 ? 'montana' : 'mediterraneo';
  // Invierno seco (Cw): dentro de los trópicos es el tropical de las mesetas africanas y americanas;
  // fuera, el subtropical húmedo de Asia oriental.
  if (cls.startsWith('Cw')) return tropico ? 'tropical' : 'subtropical';
  // Templado húmedo de verano caluroso (Cfa): subtropical húmedo, salvo en Europa (valle del Po,
  // Balcanes, bajo Danubio), que los libros dan como continental.
  if (cls === 'Cfa') return europa ? 'continental' : 'subtropical';
  if (cls[0] === 'C') {
    // Oceánico (Cfb, Cfc). Entre los trópicos solo se da en altura (Andes, África oriental), y en
    // Europa los libros lo limitan a la fachada atlántica: al este de los 10° E es continental.
    if (tropico) return 'montana';
    return europa && lon > 10 ? 'continental' : 'oceanico';
  }
  if (cls[0] === 'D') return 'continental';
  // Tundra y hielo: polar en latitudes altas, alta montaña en el resto (Tíbet, Andes, Alpes).
  return Math.abs(lat) >= 55 ? 'polar' : 'montana';
}

const cells = readFileSync(file, 'latin1')
  .split('\n')
  .slice(1)
  .map((line) => line.trim().split(/\s+/))
  .filter((parts) => parts.length === 3)
  .map(([lat, lon, cls]) => ({ lat: +lat, lon: +lon, clima: escolar(cls, +lat, +lon), peso: Math.cos((+lat * Math.PI) / 180) }));

// ── países del atlas, con sus polígonos decodificados (ver src/atlas/atlas.ts) ──
const atlas = JSON.parse(readFileSync('public/data/atlas.json', 'utf8'));
const ring = (deltas) => {
  const points = [];
  let x = 0;
  let y = 0;
  for (let i = 0; i < deltas.length; i += 2) {
    x += deltas[i];
    y += deltas[i + 1];
    points.push([x / atlas.q, y / atlas.q]);
  }
  return points;
};
const inRing = (points, x, y) => {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const countries = atlas.countries.map((c) => ({
  id: c.id,
  // `frame` es el territorio principal: deja fuera lo de ultramar (la Guayana Francesa no cuenta para Francia).
  bbox: c.frame,
  anchor: c.anchor,
  polys: c.polys.map((rings) => rings.map(ring)),
}));
// Regla par-impar con los huecos: dentro del exterior y fuera de los agujeros.
const contains = (c, x, y) => c.polys.some((rings) => rings.reduce((inside, r) => (inRing(r, x, y) ? !inside : inside), false));

const out = {};
for (const c of countries) {
  const [w, s, e, n] = c.bbox;
  const total = {};
  let sum = 0;
  for (const cell of cells) {
    if (cell.lon < w || cell.lon > e || cell.lat < s || cell.lat > n || !contains(c, cell.lon, cell.lat)) continue;
    total[cell.clima] = (total[cell.clima] ?? 0) + cell.peso;
    sum += cell.peso;
  }
  if (!sum) {
    // País diminuto: la celda con datos más cercana a su punto interior.
    let best = null;
    let bestDist = Infinity;
    for (const cell of cells) {
      const d = ((cell.lon - c.anchor[0]) * Math.cos((c.anchor[1] * Math.PI) / 180)) ** 2 + (cell.lat - c.anchor[1]) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = cell;
      }
    }
    total[best.clima] = 1;
    sum = 1;
  }
  // Porcentaje del territorio de cada clima, de mayor a menor.
  out[c.id] = Object.fromEntries(
    Object.entries(total)
      .map(([clima, peso]) => [clima, Math.round((peso / sum) * 100)])
      .filter(([, pct]) => pct > 0)
      .sort((a, b) => b[1] - a[1]),
  );
}

writeFileSync('scripts/data/climas.koppen.json', JSON.stringify(out).replace(/\},/g, '},\n') + '\n');
console.log(`climas de ${Object.keys(out).length} países y territorios`);
