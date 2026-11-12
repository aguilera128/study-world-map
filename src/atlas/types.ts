// Tipos del atlas. `Raw*` describe public/data/atlas.json tal como lo escribe
// scripts/build-atlas.mjs; el resto es la forma ya decodificada que usa la aplicación.

import type { CountryMapId } from '../game/countryMaps';

/**
 * Qué atlas es: el del mundo, el de las subdivisiones de un país (scripts/build-maps.mjs) o el de
 * geografía física (scripts/build-fisico.mjs).
 */
export type MapId = 'world' | 'fisico' | CountryMapId;

/**
 * Clave de una región del atlas. En el del mundo: europa · asia · africa · am-norte · am-central ·
 * am-caribe · am-sur · oceania. En el de un país, el código ISO 3166-2 de cada comunidad (ES-AN…) o,
 * si sus agrupaciones no lo tienen, una clave propia (us-noreste…).
 */
export type RegionKey = string;

/** Respuestas posibles a «¿en qué continente está?». `europa-asia`: repartido entre los dos. */
export type ClimateKey =
  | 'ecuatorial'
  | 'tropical'
  | 'desertico'
  | 'semiarido'
  | 'mediterraneo'
  | 'oceanico'
  | 'subtropical'
  | 'continental'
  | 'polar'
  | 'montana';

export type ContinentKey = 'europa' | 'asia' | 'africa' | 'america' | 'oceania' | 'europa-asia';

/**
 * `country`: entra en los cuestionarios (un país o, en el mapa de un país, una provincia) ·
 * `territory`/`disputed`: solo se muestra · `context`: decorado (los países de alrededor), ni se nombra ni se pulsa.
 */
export type CountryKind = 'country' | 'territory' | 'disputed' | 'context';

/** [oeste, sur, este, norte] en grados. */
export type Bounds = [west: number, south: number, east: number, north: number];

export interface RegionInfo {
  name: string;
  frame: Bounds;
}

export interface RawCountry {
  id: string;
  a2: string | null;
  name: string;
  kind: CountryKind;
  bbox: Bounds;
  frame: Bounds;
  anchor: [lon: number, lat: number];
  size: number;
  areaKm2?: number;
  /** Códigos ISO 4217 de sus monedas e ISO 639-3 de sus idiomas (solo países). */
  currencies?: string[];
  languages?: string[];
  /** Identificador de Wikidata, para enlazar a Wikipedia. */
  wd?: string;
  /** Habitantes (Banco Mundial). */
  population?: number;
  /** Año al que corresponde ese dato. */
  populationYear?: number;
  tz?: string;
  tzMulti?: boolean;
  /** Polígonos → anillos (exterior y huecos) → enteros cuantizados en deltas [x0, y0, dx, dy, …]. */
  polys: number[][][];
  capital?: string;
  /** Climas del país, de más a menos extendido (claves de CLIMATES). */
  climate?: ClimateKey[];
  regions?: RegionKey[];
  continents?: ContinentKey[];
  aliases?: string[];
  capitalAliases?: string[];
  capitalNote?: string;
  note?: string;
  sovereign?: string;
  color: number;
  neighbors?: number[];
}

export interface RawAtlas {
  version: number;
  /** Unidades por grado de las coordenadas cuantizadas. */
  q: number;
  source: string;
  /** Encuadre de la vista general cuando el mapa no es el mundo entero. */
  frame?: Bounds;
  /** El atlas lleva de fondo los países de otro (el del mundo), que no repite: se le añaden al cargarlo. */
  base?: 'world';
  /**
   * En el mapa de un país, su código en el atlas del mundo: al cargarlo se le añade de fondo el resto
   * del mundo (todo menos él y los vecinos que ya trae dibujados con más detalle).
   */
  country?: string;
  regions: Record<RegionKey, RegionInfo>;
  /** Nombre de cada continente, en el orden en que se ofrecen como respuesta. */
  continents: Record<ContinentKey, string>;
  /** Zona horaria IANA → [lon, lat, id del país] de su ciudad de referencia. */
  zones: Record<string, [lon: number, lat: number, country: string]>;
  countries: RawCountry[];
}

export interface Polygon {
  bbox: Bounds;
  /** Anillos abiertos [x0, y0, x1, y1, …] en grados: el primero es el exterior, el resto huecos. */
  rings: Float64Array[];
}

export interface Country {
  /** Posición en `Atlas.countries`; es el identificador que usa el motor del mapa. */
  index: number;
  /** ISO 3166-1 alfa-3 (o un código propio para territorios sin ISO). */
  id: string;
  /** ISO alfa-2 en minúsculas: nombre del archivo de la bandera. */
  a2: string | null;
  name: string;
  kind: CountryKind;
  /** Climas, de más a menos extendido (vacío si no hay dato). */
  climate: ClimateKey[];
  bbox: Bounds;
  /** Encuadre recomendado para la cámara (ignora islas y territorios lejanos). */
  frame: Bounds;
  /** Punto interior del polígono principal: ancla de marcadores y etiquetas. */
  anchor: [lon: number, lat: number];
  /** Tamaño angular (radianes) del polígono principal. */
  size: number;
  areaKm2?: number;
  /** Códigos ISO 4217 de sus monedas e ISO 639-3 de sus idiomas (solo países). */
  currencies?: string[];
  languages?: string[];
  /** Identificador de Wikidata, para enlazar a Wikipedia. */
  wd?: string;
  /** Habitantes (Banco Mundial), si hay dato. */
  population?: number;
  /** Año al que corresponde ese dato. */
  populationYear?: number;
  /** Zona horaria (IANA) de la capital. */
  tz?: string;
  /** El país tiene más de una hora oficial: la de `tz` es solo la de la capital. */
  tzMulti: boolean;
  capital?: string;
  regions: RegionKey[];
  /** Continentes que se aceptan como respuesta; el primero es el que se enseña. */
  continents: ContinentKey[];
  aliases: string[];
  capitalAliases: string[];
  capitalNote?: string;
  note?: string;
  /** Para territorios: id del país del que dependen. */
  sovereign?: string;
  /** Color (0–5) en el mapa político: dos vecinos nunca comparten color. */
  color: number;
  neighbors: number[];
  polygons: Polygon[];
}
