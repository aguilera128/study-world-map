#!/usr/bin/env node
// Reduce la capa de subdivisiones de Natural Earth (ne_10m_admin_1_states_provinces, dominio
// público) a las fronteras de un solo país: scripts/data/mapas/<mapa>.topo.json, que sí se versiona.
// La capa entera pesa 40 MB y no entra en el repositorio; solo hace falta para añadir un país o
// cambiar el nivel de detalle:
//
//   node scripts/build-subdivisions.mjs <ruta a ne_10m_admin_1_states_provinces.geojson> <mapa>
//
// El GeoJSON está en https://github.com/nvkelso/natural-earth-vector (carpeta geojson/).
//
// Las fronteras se simplifican sobre una topología (topojson): cada tramo compartido por dos
// provincias se simplifica una sola vez, así que no quedan huecos ni solapes entre vecinas. Los
// países de alrededor se incluyen, fundidos en una sola pieza cada uno, como decorado.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as client from 'topojson-client';
import { topology } from 'topojson-server';
import { filter, filterWeight, presimplify, simplify } from 'topojson-simplify';
import { MAPAS } from './data/mapas/index.mjs';

const [origen, id] = process.argv.slice(2);
const mapa = MAPAS[id];
if (!origen || !mapa) {
  console.error(`Uso: node scripts/build-subdivisions.mjs <geojson de Natural Earth> <${Object.keys(MAPAS).join('|')}>`);
  process.exit(1);
}

/**
 * Tramos menores que esta área (grados²) se alisan: 2e-5 ≈ un triángulo de 500 m de lado. Un país
 * mucho mayor que España se ve desde más lejos y pide menos: lo dice en `detalle` (y en `islote`).
 */
const DETALLE = mapa.detalle ?? 2e-5;
/** Islotes menores que esta área (grados²) se descartan: 5e-4 ≈ 5 km². Ceuta y Melilla superan los 12 km². */
const ISLOTE = mapa.islote ?? 5e-4;
/** Los países de alrededor son decorado: se alisan mucho más. */
const DETALLE_CONTEXTO = Math.max(4e-4, DETALLE * 4);

const capa = JSON.parse(readFileSync(origen, 'utf8'));
const [oeste, sur, este, norte] = mapa.ventana;

/** Caja [oeste, sur, este, norte] de una geometría GeoJSON. */
function caja(geometry) {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  const visita = (c) => {
    if (typeof c[0] === 'number') {
      if (c[0] < w) w = c[0];
      if (c[0] > e) e = c[0];
      if (c[1] < s) s = c[1];
      if (c[1] > n) n = c[1];
    } else c.forEach(visita);
  };
  visita(geometry.coordinates);
  return [w, s, e, n];
}

/**
 * Crimea y Sebastopol van con Ucrania, como en el mapa del mundo (scripts/build-atlas.mjs): Natural
 * Earth las asigna a Rusia. Sin esto, donde Ucrania es vecina, Crimea salía como mar.
 */
const DE_UCRANIA = new Set(['RUS-283', 'RUS-5482']);

const propias = [];
const contexto = [];
for (const f of capa.features) {
  const a3 = DE_UCRANIA.has(f.properties.adm1_code) ? 'UKR' : f.properties.adm0_a3;
  if (a3 === mapa.adm0) {
    // Lo que cae lejos de la ventana no es de este mapa (los municipios caribeños de los Países Bajos).
    const [w, s, e, n] = caja(f.geometry);
    if (!(e > oeste && w < este && n > sur && s < norte)) continue;
    // Si la capa trae un nivel más fino que el que se estudia (los departamentos de Francia), el
    // código es el del campo que dice a qué unidad pertenece cada pieza (`fundir`); se juntan abajo.
    // Natural Earth arrastra algún código ISO antiguo o equivocado: `renombrar` lo pasa al vigente.
    // Y si una pieza suelta trae el código de otra (Požega-Eslavonia, el de su vecina), `corregir`
    // le pone el suyo por su identificador en la capa (adm1_code).
    const codigo = mapa.corregir?.[f.properties.adm1_code] ?? (mapa.fundir ? String(f.properties[mapa.fundir] ?? '').trim() : f.properties.iso_3166_2);
    propias.push({ type: 'Feature', id: mapa.renombrar?.[codigo] ?? codigo, properties: {}, geometry: f.geometry });
  } else if (mapa.contexto.includes(a3)) {
    // De los vecinos solo interesa lo que cae cerca (Francia sin sus territorios de ultramar).
    const [w, s, e, n] = caja(f.geometry);
    if (e > oeste && w < este && n > sur && s < norte) contexto.push({ type: 'Feature', id: a3, properties: {}, geometry: f.geometry });
  }
}

// Las piezas de una misma unidad se funden en una, sin las fronteras de dentro.
if (mapa.fundir) {
  const piezas = topology({ capa: { type: 'FeatureCollection', features: propias } }, 1e6);
  const porCodigo = Map.groupBy(piezas.objects.capa.geometries, (g) => g.id);
  propias.length = 0;
  for (const [codigo, partes] of porCodigo) propias.push({ type: 'Feature', id: codigo, properties: {}, geometry: client.merge(piezas, partes) });
}

// La lista de Natural Earth y la escrita a mano tienen que coincidir.
const esperadas = new Set(mapa.provincias.map((p) => p.iso));
const halladas = new Set(propias.map((f) => f.id));
const faltan = [...esperadas].filter((c) => !halladas.has(c));
const sobran = [...halladas].filter((c) => !esperadas.has(c));
if (faltan.length || sobran.length || propias.length !== esperadas.size) {
  throw new Error(`Natural Earth y ${id}.mjs no coinciden. Faltan: ${faltan.join(', ') || '—'} · sobran: ${sobran.join(', ') || '—'}`);
}

/** Simplifica una colección sobre su topología y la devuelve otra vez como entidades GeoJSON. */
function reducir(features, detalle) {
  let topo = presimplify(topology({ capa: { type: 'FeatureCollection', features } }, 1e6));
  topo = simplify(topo, detalle);
  topo = filter(topo, filterWeight(topo, ISLOTE));
  return { topo, objeto: topo.objects.capa };
}

// 1) Lo propio y el contexto se simplifican juntos, para que la frontera común siga casando…
const { topo, objeto } = reducir([...propias, ...contexto], DETALLE);
const provincias = objeto.geometries.filter((g) => esperadas.has(g.id));
for (const g of provincias) if (!g.arcs?.length) throw new Error(`${g.id} se queda sin geometría al simplificar.`);

// 2) …y cada vecino se funde en una pieza (sin fronteras interiores) y se vuelve a alisar por su cuenta.
const fundidos = mapa.contexto
  .map((a3) => ({ a3, partes: objeto.geometries.filter((g) => g.id === a3 && g.arcs?.length) }))
  .filter(({ partes }) => partes.length)
  .map(({ a3, partes }) => ({ type: 'Feature', id: a3, properties: { contexto: true }, geometry: client.merge(topo, partes) }));

// Solo se alisan más los tramos que no tocan a una provincia: la frontera con ellas no se mueve.
const juntos = topology(
  {
    mapa: {
      type: 'FeatureCollection',
      features: [...provincias.map((g) => client.feature(topo, g)), ...fundidos],
    },
  },
  1e6,
);
const pesos = presimplify(juntos);
const deProvincia = new Set();
const marca = (arcs) => arcs.forEach((a) => (Array.isArray(a) ? marca(a) : deProvincia.add(a < 0 ? ~a : a)));
for (const g of pesos.objects.mapa.geometries) if (!g.properties?.contexto) marca(g.arcs);
pesos.arcs.forEach((arco, i) => {
  // presimplify deja en cada punto, como tercera coordenada, el área del triángulo que forma.
  if (deProvincia.has(i)) for (const punto of arco) punto[2] = Infinity;
});
const final = client.quantize(simplify(pesos, DETALLE_CONTEXTO), 1e5);

const destino = join(dirname(fileURLToPath(import.meta.url)), 'data', 'mapas', `${id}.topo.json`);
const json = JSON.stringify(final);
writeFileSync(destino, json + '\n');
const puntos = final.arcs.reduce((n, a) => n + a.length, 0);
console.log(`${id}.topo.json: ${provincias.length} subdivisiones + ${fundidos.length} países de contexto · ${puntos} puntos · ${(json.length / 1024).toFixed(0)} kB`);
