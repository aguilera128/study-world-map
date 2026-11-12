// Trae de Wikidata los nombres de las subdivisiones de un país (provincias, comunidades…) y de sus
// capitales en los idiomas de la aplicación, y los guarda en scripts/data/mapas/<mapa>.wikidata.json
// (que sí se versiona, para poder revisarlo). Las correcciones a mano van aparte, en `correcciones`
// de scripts/data/mapas/<mapa>.mjs. Solo hace falta ejecutarlo para añadir un país o un idioma:
//   node scripts/fetch-subdivisions.mjs es
//
// Cada entidad se busca por su código ISO 3166-2 (propiedad P300). Qué capital tiene cada provincia
// lo decide el fichero de datos en español; aquí solo se busca esa ciudad y se copian sus nombres.
// La ciudad se busca entre las capitales (P36) de la provincia y de su comunidad y, además, por su
// nombre en español entre las entidades de la clase `wikidata.capitalClase` del mapa (municipios):
// Wikidata tiene a menudo dos fichas para la misma ciudad y P36 no siempre apunta a la completa.
//
// Nombre de una provincia en otro idioma:
//   · si en español se llama igual que su capital (Sevilla), el nombre de la ciudad en ese idioma:
//     Wikidata titula la provincia «Province of Seville», «Sevillako probintzia»…, y nadie la llama así;
//   · si no (Vizcaya, Asturias), el de la propia entidad, sin la palabra «provincia».

import { writeFileSync } from 'node:fs';
import { MAPAS } from './data/mapas/index.mjs';

const mapa = MAPAS[process.argv[2]];
if (!mapa) {
  console.error(`Uso: node scripts/fetch-subdivisions.mjs <${Object.keys(MAPAS).join('|')}>`);
  process.exit(1);
}

const LANGS = ['en', 'fr', 'de', 'it', 'pt', 'ca', 'gl', 'eu', 'zh'];
const norm = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

/** «Provincia de…», «cantón de…», «estado de…» en cada idioma: se quita del nombre de la entidad. */
const TIPO = {
  en: [/^Province of /i, / Province$/i, /^Canton of (the )?/i],
  fr: [/^province (de |du |des |d[’'])/i, /^canton (de |du |des |d[’'])/i],
  de: [/^Provinz /i, /^Kanton /i],
  it: [/^provincia (di |del |della |dello |dell[’']|d[’'])/i, /^cantone? (di |del |dei |della |d[’'])?/i],
  pt: [/^província (de |da |do |das |dos |d[’'])/i, /^cantão (de |da |do |das |dos )/i],
  ca: [/^província (de |d[’'])/i, /^cantó (de |del |dels |d[’'])/i, /^estat (de |del |d[’'])/i],
  gl: [/^provincia (de |da |do |das |dos )/i, /^cantón (de |da |do |das |dos )/i, /^estado (de |da |do )/i],
  eu: [/(ko|go) probintzia$/i, / probintzia$/i, / kantonamendua$/i],
  zh: [/省$/],
};
const sinTipo = (lang, name) => TIPO[lang].reduce((s, re) => s.replace(re, ''), name).trim();
/** «Cáceres (Espanha)» → «Cáceres»; «îles Canaries» → «Îles Canaries». */
const limpio = (name) => {
  const s = name.replace(/\s*\([^)]*\)$/, '').trim();
  return s.charAt(0).toLocaleUpperCase() + s.slice(1);
};

// Igual que en fetch-capitals.mjs: en chino se prefiere la etiqueta de China continental.
const VARIANTS = { zh: ['zh-cn', 'zh-hans', 'zh'] };
const columns = LANGS.flatMap((l) => (VARIANTS[l] ?? [l]).map((tag, i) => ({ l, tag, name: `${l}${i}` })));
const labels = (subject, prefix) =>
  columns.map((c) => `OPTIONAL { ${subject} rdfs:label ?${prefix}${c.name} FILTER(lang(?${prefix}${c.name}) = "${c.tag}") }`).join('\n  ');

const query = `SELECT ?code ?item ?cap ?capEs ${columns.map((c) => `?n${c.name} ?c${c.name}`).join(' ')} WHERE {
  ?item wdt:P300 ?code. FILTER(STRSTARTS(?code, "${mapa.prefijo}"))
  ${labels('?item', 'n')}
  OPTIONAL {
    ?item wdt:P36 ?cap.
    OPTIONAL { ?cap rdfs:label ?capEs FILTER(lang(?capEs) = "es") }
    ${labels('?cap', 'c')}
  }
}`;

async function sparql(q) {
  const res = await fetch('https://query.wikidata.org/sparql', {
    method: 'POST',
    headers: { Accept: 'application/sparql-results+json', 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'geo-capitals-build/1.0' },
    body: `query=${encodeURIComponent(q)}`,
  });
  if (!res.ok) throw new Error(`Wikidata respondió ${res.status}`);
  return (await res.json()).results.bindings;
}

const rows = await sparql(query);

// Las mismas ciudades, buscadas por su nombre en español entre los municipios del país.
const nombres = [...new Set(mapa.provincias.filter((p) => p.capital).flatMap((p) => [p.capital, ...(p.capAlias ?? [])]))];
const porNombre = mapa.wikidata?.capitalClase
  ? await sparql(`SELECT ?cap ?capEs ${columns.map((c) => `?c${c.name}`).join(' ')} WHERE {
  VALUES ?capEs { ${nombres.map((n) => `${JSON.stringify(n)}@es`).join(' ')} }
  ?cap rdfs:label ?capEs; wdt:P31 wd:${mapa.wikidata.capitalClase}.
  ${labels('?cap', 'c')}
}`)
  : [];

/** Etiquetas de una fila con un prefijo (`n` nombre, `c` capital): { en: '…', fr: '…' }. */
const pick = (row, prefix) =>
  Object.fromEntries(
    LANGS.map((l) => {
      const label = columns.filter((c) => c.l === l).map((c) => row[prefix + c.name]?.value).find(Boolean);
      return [l, label ? limpio(label) : null];
    }),
  );
const filled = (o) => LANGS.filter((l) => o[l]).length;

const byCode = new Map();
for (const row of rows) {
  if (!byCode.has(row.code.value)) byCode.set(row.code.value, []);
  byCode.get(row.code.value).push(row);
}

const out = {};
const pending = [];
const missing = (code, what, o) => {
  const sin = LANGS.filter((l) => !o[l]);
  if (sin.length) pending.push(`${code} ${what}: sin nombre en ${sin.join(', ')} (se usará el español)`);
};

for (const [code, nombre] of Object.entries(mapa.comunidades)) {
  // Una agrupación sin código ISO (las regiones del censo de EE. UU.) no se busca: va a mano.
  if (!code.startsWith(mapa.prefijo)) continue;
  const options = (byCode.get(code) ?? []).map((r) => pick(r, 'n')).sort((a, b) => filled(b) - filled(a));
  if (!options.length) {
    pending.push(`${code} ${nombre}: no está en Wikidata con ese código`);
    continue;
  }
  out[code] = { n: options[0] };
  missing(code, nombre, options[0]);
}

/** Provincias por comunidad: la comunidad de una sola provincia es el mismo territorio que ella. */
const porComunidad = Map.groupBy(mapa.provincias, (p) => p.comunidad);

for (const p of mapa.provincias) {
  const unica = !!p.comunidad && porComunidad.get(p.comunidad).length === 1;
  const options = [...(byCode.get(p.iso) ?? []), ...(unica ? (byCode.get(p.comunidad) ?? []) : [])];
  // La misma ciudad que en español y, si hay varias fichas, la más completa.
  const named = (name) =>
    [...options, ...porNombre]
      .filter((r) => r.capEs && norm(r.capEs.value) === norm(name))
      .map((r) => pick(r, 'c'))
      .sort((a, b) => filled(b) - filled(a))[0];
  // Lo que solo es decorado (el Distrito de Columbia) no tiene capital que buscar.
  const c = p.capital ? [p.capital, ...(p.capAlias ?? [])].map(named).find(Boolean) : undefined;
  if (!p.capital) {
    // nada que buscar
  } else if (!c) {
    pending.push(`${p.iso} ${p.nombre}: «${p.capital}» no está entre ${[...new Set(options.map((r) => r.capEs?.value ?? '?'))].join(', ') || '(nada)'}`);
  } else missing(p.iso, `capital de ${p.nombre}`, c);

  let n;
  if (c && norm(p.nombre) === norm(p.capital)) n = c;
  else {
    // De las fichas con ese código (o, si es la única provincia de su comunidad, las de esta), la más completa.
    const own = options.map((r) => pick(r, 'n')).sort((a, b) => filled(b) - filled(a))[0];
    if (!own) pending.push(`${p.iso} ${p.nombre}: no está en Wikidata con ese código`);
    else {
      n = Object.fromEntries(LANGS.map((l) => [l, own[l] && sinTipo(l, own[l])]));
      missing(p.iso, p.nombre, n);
    }
  }
  // Una ciudad autónoma comparte código con su «comunidad»: se conserva una sola entrada.
  out[p.iso] = { ...(n ? { n } : out[p.iso]), ...(c && { c }) };
}

writeFileSync(`scripts/data/mapas/${mapa.id}.wikidata.json`, JSON.stringify(out, null, 0).replace(/\}\},/g, '}},\n') + '\n');
console.log(`${Object.keys(out).length} entidades de ${mapa.id}`);
if (pending.length) console.log(`Para revisar a mano:\n  ${pending.join('\n  ')}`);
