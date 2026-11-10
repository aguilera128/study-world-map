#!/usr/bin/env node
// Genera el atlas que consume la web:
//
//   public/data/atlas.json   países (datos en español) + geometría plana cuantizada
//   public/flags/<a2>.svg    banderas de todos los países y territorios del mapa
//
// Fuente cartográfica: Natural Earth 1:50m (paquete `world-atlas`). Sobre ella se aplican
// unos pocos ajustes para que el mapa coincida con el que se estudia en España:
//   · Crimea se dibuja como parte de Ucrania (Natural Earth la asigna a Rusia).
//   · Somalilandia se une a Somalia y el norte de Chipre a Chipre.
//   · Tuvalu no existe a esta escala: se añade como un pequeño polígono sintético.
//
// La geometría de `world-atlas` es esférica (polígonos "cosidos" en el antimeridiano). Aquí
// se vuelve a cortar por ±180° para obtener anillos planos en longitud/latitud, que es lo que
// necesita el cliente tanto para triangular como para saber qué país hay bajo el cursor.
//
// Uso:  node scripts/build-atlas.mjs [--audit]

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoEquirectangular } from 'd3-geo';
import { geoProject } from 'd3-geo-projection';
import polylabel from 'polylabel';
import * as topojson from 'topojson-client';
import { CLIMAS, climasDe } from './data/climas.mjs';
import { IDIOMAS } from './data/idiomas/index.mjs';
import { CONTINENTE_DE, CONTINENTES, PAISES, REGIONES, TERRITORIOS } from './data/paises.mjs';

/** Población por país (Banco Mundial, CC BY 4.0) y año del dato. */
const POBLACION = JSON.parse(readFileSync(new URL('./data/poblacion.worldbank.json', import.meta.url), 'utf8'));
const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT = process.argv.includes('--audit');

/** Unidades por grado al cuantizar coordenadas (1000 → milésimas de grado ≈ 110 m). */
const Q = 1000;
const NUM_COLORES = 6;
const RAD = Math.PI / 180;

const topo = require('world-atlas/countries-50m.json');
const worldCountries = JSON.parse(
  readFileSync(join(ROOT, 'node_modules/world-countries/countries.json'), 'utf8'),
);
const wcByNum = new Map(worldCountries.filter((c) => c.ccn3).map((c) => [c.ccn3, c]));
// world-countries llama UNK a Kosovo; aquí se usa XKX, el código habitual.
const wcByIso3 = new Map(worldCountries.map((c) => [c.cca3 === 'UNK' ? 'XKX' : c.cca3, c]));

// ───────────────────────── 1. Agrupar geometrías por código ─────────────────────────

/** Geometrías de Natural Earth sin código ISO, o que se integran en otro país. */
const POR_NOMBRE = {
  Somaliland: 'SOM',
  'N. Cyprus': 'CYP',
  'Indian Ocean Ter.': 'AUS',
  'Ashmore and Cartier Is.': 'AUS',
  Kosovo: 'XKX',
  'Siachen Glacier': 'XSG',
};

/** código → geometrías TopoJSON (en forma de arcos) que lo componen */
const grupos = new Map();
const añadir = (codigo, geom) => {
  if (!grupos.has(codigo)) grupos.set(codigo, []);
  grupos.get(codigo).push(geom);
};

for (const geom of topo.objects.countries.geometries) {
  const nombre = geom.properties.name;
  const codigo = POR_NOMBRE[nombre] ?? wcByNum.get(geom.id)?.cca3;
  if (!codigo) throw new Error(`Geometría sin código reconocible: "${nombre}" (id ${geom.id})`);
  añadir(codigo, geom);
}

// ───────────────────────── 2. Crimea → Ucrania ─────────────────────────

const poligonosDe = (g) => (g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : []);

function bboxAnillo(anillo) {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (const [x, y] of anillo) {
    if (x < w) w = x;
    if (x > e) e = x;
    if (y < s) s = y;
    if (y > n) n = y;
  }
  return [w, s, e, n];
}

{
  const rusia = grupos.get('RUS')[0];
  const crimea = [];
  const resto = [];
  for (const arcos of poligonosDe(rusia)) {
    const { geometry } = topojson.feature(topo, { type: 'Polygon', arcs: arcos });
    const [w, s, e, n] = bboxAnillo(geometry.coordinates[0]);
    (w > 32 && e < 37 && s > 44 && n < 46.5 ? crimea : resto).push(arcos);
  }
  if (crimea.length !== 1) {
    throw new Error(`Se esperaba 1 polígono de Crimea en Rusia y hay ${crimea.length}; revisa la fuente.`);
  }
  grupos.set('RUS', [{ type: 'MultiPolygon', arcs: resto }]);
  añadir('UKR', { type: 'Polygon', arcs: crimea[0] });
}

// ───────────────────────── 3. Comprobar la lista de países ─────────────────────────

const SINTETICOS = {
  // Funafuti, el atolón principal de Tuvalu
  TUV: { lon: 179.2, lat: -8.52, radio: 0.04 },
};

const paisPorIso = new Map(PAISES.map((p) => [p.iso3, p]));
if (paisPorIso.size !== PAISES.length) throw new Error('Hay códigos ISO repetidos en PAISES.');
if (PAISES.length !== 197) throw new Error(`Se esperaban 197 países y hay ${PAISES.length}.`);

for (const p of PAISES) {
  if (!wcByIso3.has(p.iso3)) throw new Error(`ISO3 desconocido en PAISES: ${p.iso3}`);
  if (!REGIONES[p.region]) throw new Error(`Región desconocida en ${p.iso3}: ${p.region}`);
  for (const r of p.tambien ?? []) if (!REGIONES[r]) throw new Error(`Región desconocida en ${p.iso3}: ${r}`);
  for (const c of p.continentes ?? []) if (!CONTINENTES[c]) throw new Error(`Continente desconocido en ${p.iso3}: ${c}`);
  if (!grupos.has(p.iso3) && !SINTETICOS[p.iso3]) throw new Error(`El país ${p.iso3} (${p.nombre}) no tiene geometría.`);
}
for (const codigo of grupos.keys()) {
  if (!paisPorIso.has(codigo) && !TERRITORIOS[codigo]) {
    throw new Error(`La geometría ${codigo} no está ni en PAISES ni en TERRITORIOS.`);
  }
}
// Todo miembro de la ONU debe estar en la lista, y nada que no lo sea salvo los dos Estados
// observadores y los dos de reconocimiento limitado.
const EXTRA = new Set(['VAT', 'PSE', 'TWN', 'XKX']);
for (const [iso3, c] of wcByIso3) {
  const enLista = paisPorIso.has(iso3);
  const debe = c.unMember || EXTRA.has(iso3);
  if (debe !== enLista) throw new Error(`Incoherencia con la lista de la ONU: ${iso3} (${c.name.common})`);
}

// ───────────────────────── 4. Geometría plana por entidad ─────────────────────────

// Equirrectangular con escala de 1 unidad = 1 grado y sin remuestreo adaptativo: solo interesa
// el recorte por el antimeridiano que hace d3. (Devuelve y = −latitud.)
const proyeccion = geoEquirectangular().scale(180 / Math.PI).translate([0, 0]).precision(0);

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/**
 * Anillo de d3 (cerrado, y hacia abajo) → enteros cuantizados [x0, y0, x1, y1, …] sin cierre.
 * Natural Earth cierra la Antártida con un borde a −89,999°: se lleva al polo exacto para que el
 * cliente lo reconozca como corte artificial del mapa y no lo dibuje como costa.
 */
function cuantizar(anillo) {
  const out = [];
  let px, py;
  for (const [x, y] of anillo) {
    const lat = Math.abs(y) > 89.99 ? -Math.sign(y) * 90 : -y;
    const qx = Math.round(clamp(x, -180, 180) * Q);
    const qy = Math.round(clamp(lat, -90, 90) * Q);
    if (qx === px && qy === py) continue;
    out.push(qx, qy);
    px = qx;
    py = qy;
  }
  const n = out.length;
  if (n >= 4 && out[0] === out[n - 2] && out[1] === out[n - 1]) out.length = n - 2;
  return out;
}

/** Área con signo (en unidades cuantizadas²) de un anillo plano. */
function areaAnillo(a) {
  let s = 0;
  for (let i = 0, n = a.length; i < n; i += 2) {
    const j = (i + 2) % n;
    s += a[i] * a[j + 1] - a[j] * a[i + 1];
  }
  return s / 2;
}

function poligonoSintetico({ lon, lat, radio }) {
  const anillo = [];
  for (let i = 0; i < 8; i++) {
    const t = (i / 8) * 2 * Math.PI;
    anillo.push(Math.round((lon + (radio * Math.cos(t)) / Math.cos(lat * RAD)) * Q), Math.round((lat + radio * Math.sin(t)) * Q));
  }
  return [[anillo]];
}

/** → lista de polígonos; cada polígono es [exterior, ...huecos] con anillos cuantizados. */
function geometriaPlana(codigo) {
  const partes = grupos.get(codigo);
  if (!partes) return poligonoSintetico(SINTETICOS[codigo]);
  const arcos = partes.length === 1 ? partes[0] : topojson.mergeArcs(topo, partes);
  const { geometry } = topojson.feature(topo, arcos);
  const plana = geoProject(geometry, proyeccion);
  if (!plana) throw new Error(`Geometría vacía tras proyectar: ${codigo}`);
  const poligonos = plana.type === 'Polygon' ? [plana.coordinates] : plana.coordinates;
  const out = [];
  const valido = (a) => a.length >= 6 && areaAnillo(a) !== 0;
  for (const pol of poligonos) {
    const [exterior, ...huecos] = pol.map(cuantizar);
    // Si el anillo exterior degenera al cuantizar, se descarta el polígono entero.
    if (valido(exterior)) out.push([exterior, ...huecos.filter(valido)]);
  }
  if (!out.length) throw new Error(`${codigo} se queda sin polígonos válidos al cuantizar.`);
  return out;
}

/** Área aproximada en estereorradianes de un polígono plano (exterior menos huecos). */
function areaEsferica(pol) {
  let total = 0;
  pol.forEach((anillo, i) => {
    let latMedia = 0;
    for (let k = 1; k < anillo.length; k += 2) latMedia += anillo[k];
    latMedia /= anillo.length / 2;
    const a = (Math.abs(areaAnillo(anillo)) / (Q * Q)) * Math.cos((latMedia / Q) * RAD) * RAD * RAD;
    total += i === 0 ? a : -a;
  });
  return total;
}

function bboxPoligono(pol) {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  const ext = pol[0];
  for (let i = 0; i < ext.length; i += 2) {
    if (ext[i] < w) w = ext[i];
    if (ext[i] > e) e = ext[i];
    if (ext[i + 1] < s) s = ext[i + 1];
    if (ext[i + 1] > n) n = ext[i + 1];
  }
  return [w / Q, s / Q, e / Q, n / Q];
}

const unir = (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
const red = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

/** Punto interior más alejado de los bordes (para marcadores y etiquetas). */
function puntoEtiqueta(pol) {
  const [, s, , n] = bboxPoligono(pol);
  const k = Math.max(0.05, Math.cos(((s + n) / 2) * RAD)); // corrige la anchura de los grados de longitud
  const coords = pol.map((anillo) => {
    const pts = [];
    for (let i = 0; i < anillo.length; i += 2) pts.push([(anillo[i] / Q) * k, anillo[i + 1] / Q]);
    pts.push(pts[0]);
    return pts;
  });
  // La precisión se adapta al tamaño: el Vaticano mide una centésima de grado.
  const [x, y] = polylabel(coords, Math.min(0.01, (n - s) / 50));
  return [red(x / k, 5), red(y, 5)];
}

/** Regla par-impar sobre un anillo cuantizado. */
function anilloContiene(a, x, y) {
  let dentro = false;
  for (let i = 0, j = a.length - 2; i < a.length; j = i, i += 2) {
    const yi = a[i + 1];
    const yj = a[j + 1];
    if (yi > y !== yj > y && x < ((a[j] - a[i]) * (y - yi)) / (yj - yi) + a[i]) dentro = !dentro;
  }
  return dentro;
}

const poligonoContiene = (pol, x, y) => pol.reduce((dentro, anillo) => dentro !== anilloContiene(anillo, x, y), false);

const deltas = (anillo) => {
  const out = [anillo[0], anillo[1]];
  for (let i = 2; i < anillo.length; i += 2) out.push(anillo[i] - anillo[i - 2], anillo[i + 1] - anillo[i - 1]);
  return out;
};

// ───────────────────────── 5. Montar las entidades ─────────────────────────

const codigos = [
  ...PAISES.map((p) => p.iso3),
  ...Object.keys(TERRITORIOS).filter((c) => grupos.has(c)),
];
const A2_ESPECIAL = { XKX: 'xk', XSG: null };
const a2De = (codigo) =>
  codigo in A2_ESPECIAL ? A2_ESPECIAL[codigo] : wcByIso3.get(codigo)?.cca2.toLowerCase() ?? null;

// ───────────────────────── Zonas horarias ─────────────────────────
//
// Cada país lleva la zona horaria (IANA) de su capital, para poder decir qué hora es allí.
// La base de datos de zonas viene de moment-timezone, que solo se usa aquí, al generar el atlas.

const tz = require('moment-timezone/data/meta/latest.json');
const tzEnlaces = require('moment-timezone/data/packed/latest.json').links;

/** Zona de la capital donde hay varias horas en el país, o donde la base de datos no lo recoge. */
const ZONA_CAPITAL = {
  AUS: 'Australia/Sydney',
  BRA: 'America/Sao_Paulo',
  CAN: 'America/Toronto',
  CHL: 'America/Santiago',
  CHN: 'Asia/Shanghai',
  COD: 'Africa/Kinshasa',
  ECU: 'America/Guayaquil',
  ESP: 'Europe/Madrid',
  FSM: 'Pacific/Pohnpei',
  IDN: 'Asia/Jakarta',
  KAZ: 'Asia/Almaty',
  KIR: 'Pacific/Tarawa',
  MEX: 'America/Mexico_City',
  MNG: 'Asia/Ulaanbaatar',
  NZL: 'Pacific/Auckland',
  PNG: 'Pacific/Port_Moresby',
  PRT: 'Europe/Lisbon',
  PSE: 'Asia/Hebron',
  RUS: 'Europe/Moscow',
  UKR: 'Europe/Kyiv',
  USA: 'America/New_York',
  XKX: 'Europe/Belgrade',
  GRL: 'America/Nuuk',
  PYF: 'Pacific/Tahiti',
  ATF: 'Indian/Kerguelen',
  ATA: null,
  XSG: null,
};

/** Países que la base de datos reparte en zonas con horas distintas pero tienen una sola hora oficial. */
const UNA_SOLA_HORA = new Set(['CHN', 'UKR']);

const FECHAS_PRUEBA = [0, 3, 6, 9].map((mes) => Date.UTC(new Date().getUTCFullYear(), mes, 15, 12));

/** Minutos de adelanto de una zona respecto a UTC en un instante dado. */
function desfase(zona, instante) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: zona,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).formatToParts(instante);
  const v = Object.fromEntries(partes.map((p) => [p.type, Number(p.value)]));
  return (Date.UTC(v.year, v.month - 1, v.day, v.hour, v.minute) - instante) / 60000;
}

const horario = (zona) => FECHAS_PRUEBA.map((f) => desfase(zona, f)).join(',');

/** → { zona de la capital, si el país tiene varias horas } */
function zonaHoraria(codigo, a2) {
  const zonas = tz.countries[a2?.toUpperCase()]?.zones ?? [];
  const variasHoras = new Set(zonas.map(horario)).size > 1;
  if (codigo in ZONA_CAPITAL) {
    const zona = ZONA_CAPITAL[codigo];
    if (zona) horario(zona); // lanza un error si la zona no existe
    return { zona, variasHoras: variasHoras && !UNA_SOLA_HORA.has(codigo) };
  }
  if (!zonas.length) return { zona: null, variasHoras: false };
  if (variasHoras) {
    throw new Error(`${codigo} tiene varias horas (${zonas.join(', ')}): indica la de su capital en ZONA_CAPITAL.`);
  }
  // Todas marcan la misma hora: se prefiere la que es solo de este país.
  const propia = zonas.find((z) => tz.zones[z].countries.length === 1);
  return { zona: propia ?? zonas[0], variasHoras: false };
}

/** código → polígonos planos, de mayor a menor */
const planos = new Map(
  codigos.map((codigo) => [
    codigo,
    geometriaPlana(codigo)
      .map((pol) => ({ pol, area: areaEsferica(pol) }))
      .sort((a, b) => b.area - a.area),
  ]),
);

// Comprobación de coherencia: el ancla de cada entidad debe caer dentro de ella y de ninguna otra
// (si no, hay polígonos solapados o un enclave al que le falta el hueco en el país que lo rodea).
for (const [codigo, [{ pol }]] of planos) {
  const [x, y] = puntoEtiqueta(pol).map((v) => v * Q);
  const dueños = [...planos].filter(([, ps]) => ps.some((p) => poligonoContiene(p.pol, x, y))).map(([c]) => c);
  if (dueños.length !== 1 || dueños[0] !== codigo) {
    throw new Error(`El ancla de ${codigo} cae en [${dueños.join(', ')}]: hay geometrías solapadas.`);
  }
}

let totalPuntos = 0;
const entidades = codigos.map((codigo) => {
  const pais = paisPorIso.get(codigo);
  const terr = TERRITORIOS[codigo];

  const poligonos = planos.get(codigo);
  const mayor = poligonos[0];

  let bbox = bboxPoligono(mayor.pol);
  let marco = bbox;
  for (const { pol, area } of poligonos.slice(1)) {
    const b = bboxPoligono(pol);
    bbox = unir(bbox, b);
    if (area >= mayor.area * 0.2) marco = unir(marco, b);
  }
  for (const { pol } of poligonos) for (const anillo of pol) totalPuntos += anillo.length / 2;

  const a2 = a2De(codigo);
  const hora = zonaHoraria(codigo, a2);
  const base = {
    id: codigo,
    a2,
    name: pais?.nombre ?? terr.nombre,
    kind: pais ? 'country' : terr.disputa ? 'disputed' : 'territory',
    bbox: bbox.map((v) => red(v)),
    // encuadre de cámara: solo el polígono principal y los de tamaño comparable
    frame: marco.map((v) => red(v)),
    // punto interior para marcadores y etiquetas
    anchor: puntoEtiqueta(mayor.pol),
    // tamaño angular (radianes) del polígono principal: decide cuándo hace falta un marcador
    size: red(Math.sqrt(mayor.area), 5),
    areaKm2: Math.round(wcByIso3.get(codigo)?.area ?? 0) || undefined,
    // Banco Mundial (scripts/data/poblacion.worldbank.json); sin dato para algunos territorios.
    population: POBLACION.values[codigo],
    // zona horaria de la capital y si en el país hay más de una hora
    tz: hora.zona ?? undefined,
    tzMulti: hora.variasHoras || undefined,
    polys: poligonos.map(({ pol }) => pol.map(deltas)),
  };
  if (pais && !hora.zona) throw new Error(`El país ${codigo} no tiene zona horaria.`);
  if (pais) {
    return {
      ...base,
      capital: pais.capital,
      regions: [pais.region, ...(pais.tambien ?? [])],
      // respuestas válidas a «¿en qué continente está?»; la primera es la que se enseña
      continents: pais.continentes ?? [CONTINENTE_DE[pais.region]],
      aliases: pais.alias,
      capitalAliases: pais.capAlias,
      capitalNote: pais.capNota,
      note: pais.nota,
    };
  }
  return { ...base, sovereign: terr.de, note: terr.disputa };
});

// ───────────────────────── 6. Vecinos y colores del mapa político ─────────────────────────

const objetos = codigos.map((codigo) => {
  const partes = grupos.get(codigo);
  if (!partes) return { type: 'MultiPolygon', arcs: [] };
  return partes.length === 1 ? partes[0] : topojson.mergeArcs(topo, partes);
});
const vecinos = topojson.neighbors(objetos);

// Coloreado voraz: primero los países con más vecinos, y entre los colores libres el menos usado.
const color = new Array(codigos.length).fill(-1);
const uso = new Array(NUM_COLORES).fill(0);
const orden = codigos.map((_, i) => i).sort((a, b) => vecinos[b].length - vecinos[a].length || a - b);
for (const i of orden) {
  const ocupados = new Set(vecinos[i].map((j) => color[j]));
  let mejor = -1;
  for (let c = 0; c < NUM_COLORES; c++) {
    if (ocupados.has(c)) continue;
    if (mejor < 0 || uso[c] < uso[mejor]) mejor = c;
  }
  if (mejor < 0) throw new Error(`No hay color libre para ${codigos[i]}: sube NUM_COLORES.`);
  color[i] = mejor;
  uso[mejor]++;
}
entidades.forEach((e, i) => {
  e.color = color[i];
  e.neighbors = vecinos[i].length ? vecinos[i] : undefined;
});

// ───────────────────────── 7. Escribir resultados ─────────────────────────

// Climas de cada país (scripts/build-climate.mjs y las correcciones de ./data/climas.mjs).
const koppen = JSON.parse(readFileSync(join(ROOT, 'scripts', 'data', 'climas.koppen.json'), 'utf8'));
for (const e of entidades) {
  e.climate = climasDe(e.id, koppen[e.id]);
  if (e.kind === 'country' && !e.climate?.length) throw new Error(`El país ${e.id} no tiene clima (vuelve a ejecutar scripts/build-climate.mjs).`);
  for (const clima of e.climate ?? []) if (!CLIMAS[clima]) throw new Error(`Clima desconocido en ${e.id}: ${clima}`);
}

// Zona horaria → [lon, lat, país]: la ciudad de referencia de cada zona. Sirve para situar al
// usuario de forma aproximada a partir de la zona horaria de su navegador, sin pedirle permiso.
const iso3DeA2 = new Map(entidades.filter((e) => e.a2).map((e) => [e.a2.toUpperCase(), e.id]));
// moment-timezone convierte mal las coordenadas negativas (−3°41′ → −3 + 41/60): se corrige.
const coordenada = (v) => red(v < 0 ? 2 * Math.floor(v) - v : v, 2);
const zonas = {};
for (const z of Object.values(tz.zones)) {
  const pais = z.countries.map((a2) => iso3DeA2.get(a2)).find(Boolean);
  if (pais) zonas[z.name] = [coordenada(z.long), coordenada(z.lat), pais];
}
// Nombres antiguos que algunos navegadores siguen usando («Asia/Calcutta» por «Asia/Kolkata»).
for (const enlace of tzEnlaces) {
  const [a, b] = enlace.split('|');
  if (zonas[a] && !zonas[b]) zonas[b] = zonas[a];
  else if (zonas[b] && !zonas[a]) zonas[a] = zonas[b];
}

const atlas = {
  version: 1,
  q: Q,
  source: 'Natural Earth 1:50m (world-atlas) · nombres y capitales: elaboración propia',
  regions: Object.fromEntries(Object.entries(REGIONES).map(([k, r]) => [k, { name: r.nombre, frame: r.marco }])),
  continents: CONTINENTES,
  zones: zonas,
  countries: entidades,
};

const dirDatos = join(ROOT, 'public', 'data');
const dirBanderas = join(ROOT, 'public', 'flags');
mkdirSync(dirDatos, { recursive: true });
mkdirSync(dirBanderas, { recursive: true });

// Nombres en los demás idiomas: un fichero pequeño por idioma, que la aplicación carga encima del
// atlas (ver src/atlas/atlas.ts). El país sale de CLDR, la capital de Wikidata y lo demás, de
// ./data/idiomas/<idioma>.mjs, que además corrige lo que haga falta.
const capitales = JSON.parse(readFileSync(join(ROOT, 'scripts', 'data', 'capitales.wikidata.json'), 'utf8'));
const idiomas = Object.keys(IDIOMAS).filter((idioma) => idioma !== 'es');
const hechos = {};
for (const idioma of idiomas) {
  const propio = IDIOMAS[idioma].nombres;
  const cldr = new Intl.DisplayNames([idioma], { type: 'region' });
  const paises = {};
  for (const e of entidades) {
    const extra = propio.paises[e.id] ?? {};
    // CLDR abrevia con «&»; en los nombres de la aplicación va la conjunción del idioma.
    const name = extra.nombre ?? (e.a2 ? cldr.of(e.a2.toUpperCase()).replace(' & ', IDIOMAS[idioma].y) : null);
    if (!name) throw new Error(`names.${idioma}: falta el nombre de ${e.id}`);
    const entry = { n: name, a: extra.alias, t: extra.nota };
    if (e.kind === 'country') {
      entry.c = extra.capital ?? capitales[e.id]?.[idioma] ?? capitales[e.id]?.en;
      if (!entry.c) throw new Error(`names.${idioma}: falta la capital de ${e.id}`);
      entry.ca = extra.capAlias;
      entry.cn = extra.capNota;
      // Una nota en español traducida a medias confunde más que ayuda: o está, o se avisa.
      if ((e.note && !entry.t) || (e.capitalNote && !entry.cn)) throw new Error(`names.${idioma}: falta traducir la nota de ${e.id}`);
    }
    // Idiomas con otra escritura (chino): también valen, al escribir, los nombres en alfabeto latino.
    const latino = hechos[IDIOMAS[idioma].tambien]?.[e.id];
    if (latino) {
      entry.a = [...(entry.a ?? []), latino.n, ...(latino.a ?? [])];
      if (latino.c) entry.ca = [...(entry.ca ?? []), latino.c, ...(latino.ca ?? [])];
    }
    paises[e.id] = entry;
  }
  hechos[idioma] = paises;
  for (const clave of Object.keys(REGIONES)) if (!propio.regiones[clave]) throw new Error(`names.${idioma}: falta la región ${clave}`);
  for (const clave of Object.keys(CONTINENTES)) if (!propio.continentes[clave]) throw new Error(`names.${idioma}: falta el continente ${clave}`);
  writeFileSync(join(dirDatos, `names.${idioma}.json`), JSON.stringify({ regions: propio.regiones, continents: propio.continentes, countries: paises }));
}

let banderas = 0;
for (const e of entidades) {
  if (!e.a2) continue;
  const origen = join(ROOT, 'node_modules', 'flag-icons', 'flags', '4x3', `${e.a2}.svg`);
  if (!existsSync(origen)) {
    if (e.kind === 'country') throw new Error(`Falta la bandera de ${e.id} (${e.a2}.svg)`);
    e.a2 = null;
    continue;
  }
  copyFileSync(origen, join(dirBanderas, `${e.a2}.svg`));
  banderas++;
}

const json = JSON.stringify(atlas);
writeFileSync(join(dirDatos, 'atlas.json'), json);

const nPaises = entidades.filter((e) => e.kind === 'country').length;
console.log(
  `atlas: ${nPaises} países + ${entidades.length - nPaises} territorios · ${totalPuntos} puntos · ` +
    `${(json.length / 1024).toFixed(0)} kB · ${banderas} banderas · colores ${uso.join('/')} · nombres: ${idiomas.join(', ')}`,
);

if (AUDIT) {
  console.log('\nISO  | nombre (propio) ~ world-countries | capital (propia) ~ world-countries');
  for (const p of PAISES) {
    const wc = wcByIso3.get(p.iso3);
    console.log(
      `${p.iso3} | ${p.nombre} ~ ${wc.translations.spa?.common} | ${p.capital} ~ ${(wc.capital ?? []).join(', ')}`,
    );
  }
}
