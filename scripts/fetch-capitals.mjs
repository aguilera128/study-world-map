// Trae de Wikidata el nombre de cada capital en los idiomas de la aplicación y lo guarda en
// scripts/data/capitales.wikidata.json (que sí se versiona). Las correcciones a mano van aparte, en
// scripts/data/nombres.mjs: Wikidata no siempre usa el nombre habitual. Solo hace falta ejecutarlo para añadir un idioma o un país:
//   node scripts/fetch-capitals.mjs
//
// La capital de cada país la decide scripts/data/paises.mjs (en español); aquí solo se busca esa
// misma ciudad entre las capitales que Wikidata da al país y se copian sus nombres.

import { writeFileSync } from 'node:fs';
import { PAISES } from './data/paises.mjs';

const LANGS = ['en', 'fr', 'de', 'it', 'pt', 'ca', 'gl', 'eu', 'zh'];
const norm = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

// En chino, la etiqueta «zh» de Wikidata mezcla caracteres tradicionales y simplificados y usos de
// Taiwán: se prefiere la de China continental y, si falta, la simplificada genérica.
const VARIANTS = { zh: ['zh-cn', 'zh-hans', 'zh'] };
const columns = LANGS.flatMap((l) => (VARIANTS[l] ?? [l]).map((tag, i) => ({ l, tag, name: `${l}${i}` })));

const query = `SELECT ?iso ?cap ?es ${columns.map((c) => `?${c.name}`).join(' ')} WHERE {
  ?c wdt:P298 ?iso; wdt:P36 ?cap.
  OPTIONAL { ?cap rdfs:label ?es FILTER(lang(?es) = "es") }
  ${columns.map((c) => `OPTIONAL { ?cap rdfs:label ?${c.name} FILTER(lang(?${c.name}) = "${c.tag}") }`).join('\n  ')}
}`;

const res = await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}`, {
  headers: { Accept: 'application/sparql-results+json', 'User-Agent': 'geo-capitals-build/1.0' },
});
if (!res.ok) throw new Error(`Wikidata respondió ${res.status}`);
const rows = (await res.json()).results.bindings;

const byIso = new Map();
for (const row of rows) {
  // Cada idioma se queda con la primera variante que tenga etiqueta.
  for (const l of LANGS) row[l] = columns.filter((c) => c.l === l).map((c) => row[c.name]).find(Boolean);
  const iso = row.iso.value;
  if (!byIso.has(iso)) byIso.set(iso, []);
  byIso.get(iso).push(row);
}

const out = {};
const pending = [];
for (const pais of PAISES) {
  const options = byIso.get(pais.iso3) ?? [];
  const labels = (r) => LANGS.filter((l) => r[l]).length;
  // La misma ciudad que en español (antes el nombre principal que los alternativos) y, si Wikidata
  // tiene varias fichas para ella, la más completa. Si el país solo tiene una capital, esa.
  const named = (name) => options.filter((r) => r.es && norm(r.es.value) === norm(name)).sort((x, y) => labels(y) - labels(x))[0];
  const match =
    [pais.capital, ...(pais.capAlias ?? [])].map(named).find(Boolean) ??
    (new Set(options.map((r) => r.cap.value)).size === 1 ? options[0] : null);
  if (!match) {
    pending.push(`${pais.iso3} ${pais.nombre}: «${pais.capital}» no está entre ${options.map((r) => r.es?.value ?? '?').join(', ') || '(nada)'}`);
    continue;
  }
  out[pais.iso3] = Object.fromEntries(LANGS.map((l) => [l, match[l]?.value ?? null]));
  const missing = LANGS.filter((l) => !match[l]);
  if (missing.length) pending.push(`${pais.iso3} ${pais.nombre}: sin nombre en ${missing.join(', ')}`);
}

writeFileSync(
  'scripts/data/capitales.wikidata.json',
  JSON.stringify(out, null, 0).replace(/\},/g, '},\n') + '\n',
);
console.log(`${Object.keys(out).length} de ${PAISES.length} capitales`);
if (pending.length) console.log(`Para revisar a mano:\n  ${pending.join('\n  ')}`);
