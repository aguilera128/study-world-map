#!/usr/bin/env node
// Genera el atlas del mapa de geografía física, con el mismo formato que los demás (`RawAtlas` en
// src/atlas/types.ts):
//
//   public/data/fisico/atlas.json            accidentes geográficos (en español) + países de fondo
//   public/data/fisico/names.<idioma>.json   nombres en cada idioma
//
// Entradas: el atlas del mundo ya generado (public/data/atlas.json, de build-atlas.mjs) y
// public/data/fisico.json (scripts/build-physical.py), del que solo se toman los elementos del
// temario (`quiz`). La salida no se versiona: se regenera en `pnpm dev` y `pnpm build`.
//
// Cada accidente es una entidad de tipo `country` sin polígonos: el motor la enseña como un
// marcador en su ancla, que es lo que se toca. Los países son de tipo `context`: solo decorado.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'public', 'data');
const IDIOMAS = ['en', 'fr', 'de', 'it', 'pt', 'ca', 'gl', 'eu', 'zh'];

/** Grupos entre los que se elige qué estudiar: son las «regiones» de este atlas. */
const GRUPOS = {
  montanas: {
    clases: ['cordillera', 'pico'],
    nombre: { es: 'Montañas', en: 'Mountains', fr: 'Montagnes', de: 'Gebirge', it: 'Montagne', pt: 'Montanhas', ca: 'Muntanyes', gl: 'Montañas', eu: 'Mendiak', zh: '山脉' },
  },
  rios: {
    clases: ['rio', 'lago'],
    nombre: { es: 'Ríos y lagos', en: 'Rivers and lakes', fr: 'Fleuves et lacs', de: 'Flüsse und Seen', it: 'Fiumi e laghi', pt: 'Rios e lagos', ca: 'Rius i llacs', gl: 'Ríos e lagos', eu: 'Ibaiak eta aintzirak', zh: '河流和湖泊' },
  },
  mares: {
    clases: ['oceano', 'mar', 'golfo', 'estrecho'],
    nombre: { es: 'Mares y océanos', en: 'Seas and oceans', fr: 'Mers et océans', de: 'Meere und Ozeane', it: 'Mari e oceani', pt: 'Mares e oceanos', ca: 'Mars i oceans', gl: 'Mares e océanos', eu: 'Itsasoak eta ozeanoak', zh: '海洋' },
  },
  tierras: {
    clases: ['desierto', 'meseta', 'llanura', 'peninsula', 'isla'],
    nombre: { es: 'Desiertos, llanuras e islas', en: 'Deserts, plains and islands', fr: 'Déserts, plaines et îles', de: 'Wüsten, Ebenen und Inseln', it: 'Deserti, pianure e isole', pt: 'Desertos, planícies e ilhas', ca: 'Deserts, planes i illes', gl: 'Desertos, chairas e illas', eu: 'Basamortuak, lautadak eta uharteak', zh: '沙漠、平原和岛屿' },
  },
};
/** Medio ancho, en grados, del encuadre al señalar un elemento de cada clase. */
const MARGEN = { oceano: 55, mar: 14, golfo: 12, estrecho: 6, cordillera: 14, pico: 6, rio: 14, lago: 7, desierto: 14, meseta: 14, llanura: 16, peninsula: 12, isla: 10 };
// Encuadre de cada grupo: medio mundo, para que el globo se vea entero y no desde lejos.
const MUNDO = [-70, -45, 70, 55];

const mundo = JSON.parse(readFileSync(join(DATA, 'atlas.json'), 'utf8'));
const fisico = JSON.parse(readFileSync(join(DATA, 'fisico.json'), 'utf8'));
const grupoDe = (clase) => Object.keys(GRUPOS).find((g) => GRUPOS[g].clases.includes(clase));
const red = (v) => Math.round(v * 100) / 100;

const elementos = fisico.features.filter((f) => f.quiz);
const entidades = [
  // Los países, de fondo: ni se nombran ni se tocan.
  ...mundo.countries.map((c) => ({ id: c.id, a2: null, name: c.name, kind: 'context', bbox: c.bbox, frame: c.frame, anchor: c.anchor, size: c.size, polys: c.polys, color: c.color })),
  ...elementos.map((f) => {
    const [lon, lat] = f.at;
    const m = MARGEN[f.kind];
    const marco = [red(Math.max(lon - m, -180)), red(Math.max(lat - m * 0.6, -85)), red(Math.min(lon + m, 180)), red(Math.min(lat + m * 0.6, 85))];
    return { id: f.id, a2: null, name: f.names.es, kind: 'country', bbox: [lon, lat, lon, lat], frame: marco, anchor: [lon, lat], size: 0, polys: [], regions: [grupoDe(f.kind)], color: 0 };
  }),
];

const atlas = {
  version: 1,
  q: mundo.q,
  source: fisico.source,
  regions: Object.fromEntries(Object.entries(GRUPOS).map(([clave, g]) => [clave, { name: g.nombre.es, frame: MUNDO }])),
  continents: {},
  zones: {},
  countries: entidades,
};

const destino = join(DATA, 'fisico');
mkdirSync(destino, { recursive: true });
const json = JSON.stringify(atlas);
writeFileSync(join(destino, 'atlas.json'), json);

// Sin nombre en un idioma se usa el inglés (y, si tampoco, el español). Al escribir vale también el
// nombre en español.
let sinNombre = 0;
for (const idioma of IDIOMAS) {
  const countries = {};
  for (const f of elementos) {
    const n = f.names[idioma] ?? f.names.en ?? f.names.es;
    if (!f.names[idioma]) sinNombre++;
    countries[f.id] = { n, a: n === f.names.es ? undefined : [f.names.es] };
  }
  const regions = Object.fromEntries(Object.entries(GRUPOS).map(([clave, g]) => [clave, g.nombre[idioma]]));
  writeFileSync(join(destino, `names.${idioma}.json`), JSON.stringify({ regions, continents: {}, countries }));
}

console.log(`mapa fisico: ${elementos.length} accidentes geográficos + ${mundo.countries.length} países de fondo · ${(json.length / 1024).toFixed(0)} kB · ${sinNombre} nombres sin traducir`);
