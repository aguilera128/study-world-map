// Trae de Wikidata (CC0) el identificador de cada país o territorio por su código ISO 3166-1 alfa-3.
// Con él, la ficha enlaza al artículo de Wikipedia en el idioma de la interfaz sin guardar títulos.
// Solo hace falta volver a ejecutarlo si se añaden países: node scripts/fetch-country-ids.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

async function main() {
  const query = 'SELECT ?iso ?item WHERE { ?item wdt:P298 ?iso }';
  const res = await fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query), {
    headers: { 'User-Agent': 'atlas-build-script/1.0' },
  });
  if (!res.ok) throw new Error(`Wikidata respondió ${res.status}`);
  const ids = {};
  for (const row of (await res.json()).results.bindings) {
    const iso = row.iso.value;
    const id = row.item.value.split('/').pop();
    // Si un código lo comparten varias entradas (estados históricos), gana el identificador más bajo: el país actual.
    if (!ids[iso] || Number(id.slice(1)) < Number(ids[iso].slice(1))) ids[iso] = id;
  }
  const sorted = Object.fromEntries(Object.keys(ids).sort().map((iso) => [iso, ids[iso]]));
  writeFileSync(new URL('./data/paises.wikidata-ids.json', import.meta.url), JSON.stringify(sorted, null, 0).replace(/","/g, '",\n"') + '\n');
  console.log(`${Object.keys(sorted).length} identificadores`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
