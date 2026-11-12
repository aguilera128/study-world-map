#!/usr/bin/env node
// Genera los atlas de los mapas de subdivisiones (España por provincias…), con el mismo formato que
// el del mundo (`RawAtlas` en src/atlas/types.ts), para que la aplicación cargue uno u otro:
//
//   public/data/<mapa>/atlas.json            subdivisiones (datos en español) + geometría cuantizada
//   public/data/<mapa>/names.<idioma>.json   nombres en cada idioma
//
// Entradas, todas versionadas, en scripts/data/mapas/ (ver es.mjs): los datos en español, las
// fronteras reducidas de Natural Earth (<mapa>.topo.json) y los nombres de Wikidata
// (<mapa>.wikidata.json). La salida no se versiona: se regenera en `pnpm dev` y `pnpm build`.
//
// En el atlas, cada provincia es una entidad de tipo `country` (entra en los cuestionarios), su
// comunidad es su «región» y los países de alrededor son de tipo `context`: solo decorado.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import polylabel from 'polylabel';
import * as topojson from 'topojson-client';
import { IDIOMAS } from './data/idiomas/index.mjs';
import { MAPAS } from './data/mapas/index.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
/** Unidades por grado al cuantizar (milésimas de grado ≈ 110 m), como en el atlas del mundo. */
const Q = 1000;
const NUM_COLORES = 6;
const RAD = Math.PI / 180;
const red = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;
const unir = (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];

// ───────────────────────── geometría (como en build-atlas.mjs) ─────────────────────────

/** Anillo GeoJSON (cerrado) → enteros cuantizados [x0, y0, x1, y1, …] sin cierre ni puntos repetidos. */
function cuantizar(anillo) {
  const out = [];
  let px, py;
  for (const [x, y] of anillo) {
    const qx = Math.round(x * Q);
    const qy = Math.round(y * Q);
    if (qx === px && qy === py) continue;
    out.push(qx, qy);
    px = qx;
    py = qy;
  }
  const n = out.length;
  if (n >= 4 && out[0] === out[n - 2] && out[1] === out[n - 1]) out.length = n - 2;
  return out;
}

function areaAnillo(a) {
  let s = 0;
  for (let i = 0, n = a.length; i < n; i += 2) {
    const j = (i + 2) % n;
    s += a[i] * a[j + 1] - a[j] * a[i + 1];
  }
  return s / 2;
}

/** Área aproximada en estereorradianes de un polígono (exterior menos huecos). */
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

function bboxPoligono([ext]) {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (let i = 0; i < ext.length; i += 2) {
    if (ext[i] < w) w = ext[i];
    if (ext[i] > e) e = ext[i];
    if (ext[i + 1] < s) s = ext[i + 1];
    if (ext[i + 1] > n) n = ext[i + 1];
  }
  return [w / Q, s / Q, e / Q, n / Q];
}

/** Punto interior más alejado de los bordes (para marcadores y etiquetas). */
function puntoEtiqueta(pol) {
  const [, s, , n] = bboxPoligono(pol);
  const k = Math.max(0.05, Math.cos(((s + n) / 2) * RAD));
  const coords = pol.map((anillo) => {
    const pts = [];
    for (let i = 0; i < anillo.length; i += 2) pts.push([(anillo[i] / Q) * k, anillo[i + 1] / Q]);
    pts.push(pts[0]);
    return pts;
  });
  const [x, y] = polylabel(coords, Math.min(0.01, (n - s) / 50));
  return [red(x / k, 5), red(y, 5)];
}

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

// ───────────────────────── un atlas por mapa ─────────────────────────

const idiomas = Object.keys(IDIOMAS).filter((idioma) => idioma !== 'es');

for (const mapa of Object.values(MAPAS)) {
  const dir = join(ROOT, 'scripts', 'data', 'mapas');
  const topo = JSON.parse(readFileSync(join(dir, `${mapa.id}.topo.json`), 'utf8'));
  const wikidata = JSON.parse(readFileSync(join(dir, `${mapa.id}.wikidata.json`), 'utf8'));
  const geometrias = new Map(topo.objects.mapa.geometries.map((g) => [g.id, g]));

  // Primero lo que se pregunta y después lo que solo es decorado (`decorado: true`: el Distrito de
  // Columbia, que no es un estado): así los índices de las vecinas valen tal cual.
  const preguntadas = mapa.provincias.filter((p) => !p.decorado);
  const unidades = [...preguntadas, ...mapa.provincias.filter((p) => p.decorado)];
  const isos = unidades.map((p) => p.iso);
  const conGrupos = Object.keys(mapa.comunidades).length > 0;
  if (new Set(isos).size !== isos.length) throw new Error(`${mapa.id}: hay códigos repetidos en las provincias.`);
  for (const p of unidades) {
    if (!p.iso.startsWith(mapa.prefijo)) throw new Error(`${mapa.id}: ${p.iso} no empieza por ${mapa.prefijo}`);
    if (!p.nombre) throw new Error(`${mapa.id}: a ${p.iso} le falta el nombre.`);
    if (!geometrias.has(p.iso)) throw new Error(`${mapa.id}: ${p.iso} (${p.nombre}) no tiene geometría: vuelve a ejecutar scripts/build-subdivisions.mjs.`);
    if (p.decorado) continue;
    if (!p.capital) throw new Error(`${mapa.id}: a ${p.iso} le falta la capital.`);
    // Un país sin agrupaciones (estados federados que no se reúnen en nada) no lleva ninguna.
    if (conGrupos ? !mapa.comunidades[p.comunidad] : p.comunidad) throw new Error(`${mapa.id}: comunidad desconocida en ${p.iso}: ${p.comunidad}`);
  }
  for (const clave of Object.keys(mapa.comunidades)) {
    if (!preguntadas.some((p) => p.comunidad === clave)) throw new Error(`${mapa.id}: la comunidad ${clave} no tiene provincias.`);
  }
  const contexto = mapa.contexto.filter((a3) => geometrias.has(a3));

  // No corta por el antimeridiano: la capa de subdivisiones de Natural Earth ya trae partido lo que
  // lo cruza (las Aleutianas), con un trozo a cada lado. Se comprueba aquí mismo que es así.
  /** código → polígonos planos cuantizados [exterior, ...huecos], de mayor a menor */
  const planos = new Map(
    [...isos, ...contexto].map((codigo) => {
      const { geometry } = topojson.feature(topo, geometrias.get(codigo));
      const poligonos = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
      const valido = (a) => a.length >= 6 && areaAnillo(a) !== 0;
      const out = [];
      for (const pol of poligonos) {
        const [exterior, ...huecos] = pol.map(cuantizar);
        if (valido(exterior)) out.push([exterior, ...huecos.filter(valido)]);
      }
      if (!out.length) throw new Error(`${mapa.id}: ${codigo} se queda sin polígonos válidos al cuantizar.`);
      for (const pol of out) {
        const [w, , e] = bboxPoligono(pol);
        if (e - w > 180) throw new Error(`${mapa.id}: un polígono de ${codigo} cruza el antimeridiano sin partir.`);
      }
      return [codigo, out.map((pol) => ({ pol, area: areaEsferica(pol) })).sort((a, b) => b.area - a.area)];
    }),
  );

  // El ancla de cada entidad debe caer dentro de ella y de ninguna otra (enclaves sin hueco, solapes).
  for (const [codigo, [{ pol }]] of planos) {
    const [x, y] = puntoEtiqueta(pol).map((v) => v * Q);
    const dueños = [...planos].filter(([, ps]) => ps.some((p) => poligonoContiene(p.pol, x, y))).map(([c]) => c);
    if (dueños.length !== 1 || dueños[0] !== codigo) throw new Error(`${mapa.id}: el ancla de ${codigo} cae en [${dueños.join(', ')}].`);
  }

  let totalPuntos = 0;
  const base = (codigo) => {
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
    return {
      id: codigo,
      a2: null,
      bbox: bbox.map((v) => red(v)),
      frame: marco.map((v) => red(v)),
      anchor: puntoEtiqueta(mayor.pol),
      size: red(Math.sqrt(mayor.area), 5),
      polys: poligonos.map(({ pol }) => pol.map(deltas)),
    };
  };

  const nombrePais = new Intl.DisplayNames(['es'], { type: 'region' });
  const a2De = { SAH: 'EH' };
  /** Códigos de Natural Earth que en el atlas del mundo son otros (ISO alfa-3 y el habitual de Kosovo). */
  const ID_MUNDO = { SAH: 'ESH', KOS: 'XKX' };
  const entidades = [
    ...unidades.map((p) =>
      p.decorado
        ? { ...base(p.iso), name: p.nombre, kind: 'context' }
        : {
            ...base(p.iso),
            name: p.nombre,
            kind: 'country',
            capital: p.capital,
            regions: p.comunidad ? [p.comunidad] : [],
            aliases: p.alias,
            capitalAliases: p.capAlias,
          },
    ),
    ...contexto.map((a3) => {
      const a2 = a2De[a3] ?? topoA2(a3);
      // Con el código que tiene en el atlas del mundo: así la aplicación no lo dibuja otra vez de fondo.
      return { ...base(a3), id: ID_MUNDO[a3] ?? a3, name: a2 ? nombrePais.of(a2) : a3, kind: 'context' };
    }),
  ];

  // Vecinas y colores del mapa político: dos vecinas nunca comparten color. Como vecinas solo se
  // apuntan las que se preguntan (de ahí salen las opciones de respuesta), no el decorado.
  const vecinos = topojson.neighbors(isos.map((iso) => geometrias.get(iso)));
  const color = new Array(isos.length).fill(-1);
  const uso = new Array(NUM_COLORES).fill(0);
  const orden = isos.map((_, i) => i).sort((a, b) => vecinos[b].length - vecinos[a].length || a - b);
  for (const i of orden) {
    const ocupados = new Set(vecinos[i].map((j) => color[j]));
    let mejor = -1;
    for (let c = 0; c < NUM_COLORES; c++) {
      if (ocupados.has(c)) continue;
      if (mejor < 0 || uso[c] < uso[mejor]) mejor = c;
    }
    if (mejor < 0) throw new Error(`${mapa.id}: no hay color libre para ${isos[i]}.`);
    color[i] = mejor;
    uso[mejor]++;
  }
  entidades.forEach((e, i) => {
    e.color = color[i] ?? 0;
    const propias = i < preguntadas.length ? vecinos[i].filter((j) => j < preguntadas.length) : [];
    e.neighbors = propias.length ? propias : undefined;
  });

  // Encuadres: el de cada comunidad (sus provincias) y el del mapa entero (todas).
  // Lo que tiene un trozo a cada lado del antimeridiano (Alaska) ocupa, según su caja, el mundo
  // entero: se encuadra por su parte principal.
  const cajaDe = (e) => (e.bbox[2] - e.bbox[0] > 180 ? e.frame : e.bbox);
  const marcoDe = (lista) => lista.map(cajaDe).reduce(unir).map((v) => red(v));
  const provincias = entidades.slice(0, preguntadas.length);
  const atlas = {
    version: 1,
    q: Q,
    source: mapa.fuente,
    // El resto del mundo lo pone de fondo la aplicación, del atlas mundial (ver `withBackdrop`).
    country: mapa.adm0,
    // El de todas sus unidades juntas, salvo que el mapa diga otro (`marco`: Portugal sin las islas).
    frame: mapa.marco ?? marcoDe(provincias),
    regions: Object.fromEntries(
      Object.entries(mapa.comunidades).map(([clave, nombre]) => [clave, { name: nombre, frame: marcoDe(provincias.filter((e) => e.regions[0] === clave)) }]),
    ),
    continents: {},
    zones: {},
    countries: entidades,
  };

  const destino = join(ROOT, 'public', 'data', mapa.id);
  mkdirSync(destino, { recursive: true });
  const json = JSON.stringify(atlas);
  writeFileSync(join(destino, 'atlas.json'), json);

  // Nombres en los demás idiomas: corrección a mano > Wikidata > español. Al escribir también vale
  // siempre el nombre en español (y sus alias).
  const sinRepetir = (lista, propio) => {
    const out = [...new Set(lista.filter((s) => s && s !== propio))];
    return out.length ? out : undefined;
  };
  for (const idioma of idiomas) {
    const propio = mapa.correcciones[idioma] ?? {};
    const paises = {};
    for (const p of unidades) {
      const extra = propio.provincias?.[p.iso] ?? {};
      const n = extra.nombre ?? wikidata[p.iso]?.n?.[idioma] ?? p.nombre;
      if (p.decorado) {
        paises[p.iso] = { n };
        continue;
      }
      // Sin nombre para la capital (las ciudades-estado, que en Wikidata no tienen capital): si en
      // español se llama igual que la unidad, también en este idioma (Berlín → Berlin, Viena → Wien).
      const c = extra.capital ?? wikidata[p.iso]?.c?.[idioma] ?? (p.capital === p.nombre ? n : p.capital);
      paises[p.iso] = {
        n,
        c,
        a: sinRepetir([...(extra.alias ?? []), p.nombre, ...(p.alias ?? [])], n),
        ca: sinRepetir([...(extra.capAlias ?? []), p.capital, ...(p.capAlias ?? [])], c),
      };
    }
    const regions = Object.fromEntries(
      Object.entries(mapa.comunidades).map(([clave, nombre]) => [clave, propio.comunidades?.[clave] ?? wikidata[clave]?.n?.[idioma] ?? nombre]),
    );
    writeFileSync(join(destino, `names.${idioma}.json`), JSON.stringify({ regions, continents: {}, countries: paises }));
  }

  console.log(
    `mapa ${mapa.id}: ${preguntadas.length} subdivisiones${unidades.length > preguntadas.length ? ` (+${unidades.length - preguntadas.length} de decorado)` : ''} en ${Object.keys(mapa.comunidades).length} regiones + ${contexto.length} países de contexto · ` +
      `${totalPuntos} puntos · ${(json.length / 1024).toFixed(0)} kB · colores ${uso.join('/')}`,
  );
}

/** ISO alfa-2 de un país a partir de su alfa-3 (solo para nombrar el decorado). */
function topoA2(a3) {
  const paises = JSON.parse(readFileSync(join(ROOT, 'node_modules', 'world-countries', 'countries.json'), 'utf8'));
  return paises.find((c) => c.cca3 === a3)?.cca2 ?? null;
}
