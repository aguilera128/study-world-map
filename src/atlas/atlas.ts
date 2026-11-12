import type { Bounds, ContinentKey, Country, MapId, Polygon, RawAtlas, RawCountry, RegionInfo, RegionKey } from './types';

/** Longitud máxima (grados) de un tramo de anillo: los más largos se subdividen al decodificar. */
const MAX_SEGMENT = 1;

/**
 * Los anillos llegan como enteros en deltas. Además de decodificarlos se parten los tramos largos
 * (fronteras rectas, el borde de la Antártida, los cortes del antimeridiano): así una línea recta
 * en longitud/latitud sigue pegada a la superficie cuando se curva sobre el globo.
 */
function decodeRing(deltas: number[], q: number): Float64Array {
  const n = deltas.length / 2;
  const xs = new Float64Array(n);
  const ys = new Float64Array(n);
  let x = 0;
  let y = 0;
  for (let i = 0; i < n; i++) {
    x += deltas[2 * i];
    y += deltas[2 * i + 1];
    xs[i] = x / q;
    ys[i] = y / q;
  }
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    out.push(xs[i], ys[i]);
    const dx = xs[j] - xs[i];
    const dy = ys[j] - ys[i];
    const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / MAX_SEGMENT);
    for (let k = 1; k < steps; k++) out.push(xs[i] + (dx * k) / steps, ys[i] + (dy * k) / steps);
  }
  return Float64Array.from(out);
}

function ringBounds(ring: Float64Array): Bounds {
  let w = Infinity;
  let s = Infinity;
  let e = -Infinity;
  let n = -Infinity;
  for (let i = 0; i < ring.length; i += 2) {
    const x = ring[i];
    const y = ring[i + 1];
    if (x < w) w = x;
    if (x > e) e = x;
    if (y < s) s = y;
    if (y > n) n = y;
  }
  return [w, s, e, n];
}

function decodeCountry(raw: RawCountry, index: number, q: number): Country {
  const polygons: Polygon[] = raw.polys.map((rawRings) => {
    const rings = rawRings.map((r) => decodeRing(r, q));
    return { bbox: ringBounds(rings[0]), rings };
  });
  return {
    index,
    id: raw.id,
    a2: raw.a2,
    name: raw.name,
    kind: raw.kind,
    bbox: raw.bbox,
    frame: raw.frame,
    anchor: raw.anchor,
    size: raw.size,
    areaKm2: raw.areaKm2,
    currencies: raw.currencies,
    languages: raw.languages,
    wd: raw.wd,
    population: raw.population,
    populationYear: raw.populationYear,
    tz: raw.tz,
    tzMulti: raw.tzMulti ?? false,
    capital: raw.capital,
    climate: raw.climate ?? [],
    regions: raw.regions ?? [],
    continents: raw.continents ?? [],
    aliases: raw.aliases ?? [],
    capitalAliases: raw.capitalAliases ?? [],
    capitalNote: raw.capitalNote,
    note: raw.note,
    sovereign: raw.sovereign,
    color: raw.color,
    neighbors: raw.neighbors ?? [],
    polygons,
  };
}

/** Regla par-impar: cuántas veces cruza los anillos una semirrecta horizontal desde el punto. */
function ringCrossings(ring: Float64Array, x: number, y: number): boolean {
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 2; i < n; j = i, i += 2) {
    const yi = ring[i + 1];
    const yj = ring[j + 1];
    if (yi > y !== yj > y && x < ((ring[j] - ring[i]) * (y - yi)) / (yj - yi) + ring[i]) inside = !inside;
  }
  return inside;
}

function polygonContains(polygon: Polygon, x: number, y: number): boolean {
  const [w, s, e, n] = polygon.bbox;
  if (x < w || x > e || y < s || y > n) return false;
  let inside = false;
  for (const ring of polygon.rings) if (ringCrossings(ring, x, y)) inside = !inside;
  return inside;
}

export class Atlas {
  /** Qué mapa es: de él dependen los retos, los filtros y los textos (src/game/maps.ts). */
  readonly map: MapId;
  /** Encuadre de la vista general, o null si es el mundo entero. */
  readonly frame: Bounds | null;
  readonly countries: Country[];
  readonly regions: Record<RegionKey, RegionInfo>;
  readonly continents: Record<ContinentKey, string>;
  readonly zones: RawAtlas['zones'];
  /** Índices de los países que entran en los cuestionarios (todo lo que no es un territorio). */
  readonly quizzable: number[];
  private readonly byId = new Map<string, number>();
  private lastHit = -1;

  constructor(raw: RawAtlas, map: MapId = 'world') {
    this.map = map;
    this.frame = raw.frame ?? null;
    this.countries = raw.countries.map((c, i) => decodeCountry(c, i, raw.q));
    this.regions = raw.regions;
    this.continents = raw.continents;
    this.zones = raw.zones;
    this.quizzable = this.countries.filter((c) => c.kind === 'country').map((c) => c.index);
    for (const c of this.countries) this.byId.set(c.id, c.index);
  }

  /** Índice del país con ese id, o −1. */
  indexOf(id: string): number {
    return this.byId.get(id) ?? -1;
  }

  byIdOrThrow(id: string): Country {
    const i = this.indexOf(id);
    if (i < 0) throw new Error(`País desconocido: ${id}`);
    return this.countries[i];
  }

  private contains(index: number, lon: number, lat: number): boolean {
    const c = this.countries[index];
    const [w, s, e, n] = c.bbox;
    if (lon < w || lon > e || lat < s || lat > n) return false;
    for (const polygon of c.polygons) if (polygonContains(polygon, lon, lat)) return true;
    return false;
  }

  /** País que contiene el punto (en grados), o −1 si cae en el mar. */
  locate(lon: number, lat: number): number {
    // El cursor suele seguir dentro del mismo país: se prueba primero el último acierto.
    if (this.lastHit >= 0 && this.contains(this.lastHit, lon, lat)) return this.lastHit;
    for (let i = 0; i < this.countries.length; i++) {
      if (i !== this.lastHit && this.contains(i, lon, lat)) {
        this.lastHit = i;
        return i;
      }
    }
    return -1;
  }
}

/** Nombres de un idioma (public/data/names.<idioma>.json): lo que cambia del atlas al traducirlo. */
interface RawNames {
  regions: Record<RegionKey, string>;
  continents: Record<ContinentKey, string>;
  /** n = nombre, c = capital, a = alias, ca = alias de la capital, cn = nota de la capital, t = nota */
  countries: Record<string, { n: string; c?: string; a?: string[]; ca?: string[]; cn?: string; t?: string }>;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo cargar el atlas (${res.status})`);
  return (await res.json()) as T;
}

/**
 * Añade a un atlas, como decorado, los países del atlas del mundo que no trae. Al de geografía
 * física, todos y por delante (sus accidentes son puntos encima). Al de un país, el resto del mundo
 * y por detrás: todo menos el propio país y los vecinos que ya lleva dibujados con el detalle de sus
 * fronteras; sin ello, lo que no es vecino saldría como mar. Van al final para no mover los índices
 * de las vecinas.
 */
export function withBackdrop(raw: RawAtlas, world: RawAtlas): RawAtlas {
  const own = new Set(raw.country ? [raw.country, ...raw.countries.map((c) => c.id)] : []);
  const backdrop = world.countries
    .filter((c) => !own.has(c.id))
    // (con su bandera: al pasar el cursor se sigue viendo qué país es)
    .map((c): RawCountry => ({ id: c.id, a2: c.a2, name: c.name, kind: 'context', bbox: c.bbox, frame: c.frame, anchor: c.anchor, size: c.size, polys: c.polys, color: c.color }));
  raw.countries = raw.country ? [...raw.countries, ...backdrop] : [...backdrop, ...raw.countries];
  return raw;
}

/**
 * Carga el atlas de un mapa (en español) y, si el idioma es otro, le pone encima los nombres de ese
 * idioma. El del mundo está en /data/ y el de cada país en su carpeta (/data/es/).
 */
export async function loadAtlas(lang = 'es', map: MapId = 'world'): Promise<Atlas> {
  const dir = map === 'world' ? '/data' : `/data/${map}`;
  const [raw, names, worldNames] = await Promise.all([
    getJson<RawAtlas>(`${dir}/atlas.json`),
    lang === 'es' ? null : getJson<RawNames>(`${dir}/names.${lang}.json`),
    // El decorado (los países de alrededor en el mapa de un país) toma su nombre del atlas del mundo.
    lang === 'es' || map === 'world' ? null : getJson<RawNames>(`/data/names.${lang}.json`).catch(() => null),
  ]);
  // Los países del mundo, como decorado: ya suelen estar descargados, así que no se repiten en este atlas.
  if (raw.base === 'world' || raw.country) withBackdrop(raw, await getJson<RawAtlas>('/data/atlas.json'));
  if (names) {
    for (const key of Object.keys(raw.regions) as RegionKey[]) raw.regions[key].name = names.regions[key];
    raw.continents = names.continents;
    for (const country of raw.countries) {
      const own = names.countries[country.id];
      if (!own) {
        // Decorado: solo el nombre, para el aviso al pasar el cursor.
        const world = worldNames?.countries[country.id];
        if (world) country.name = world.n;
        continue;
      }
      country.name = own.n;
      country.capital = own.c;
      country.aliases = own.a;
      country.capitalAliases = own.ca;
      country.capitalNote = own.cn;
      country.note = own.t;
    }
  }
  return new Atlas(raw, map);
}
