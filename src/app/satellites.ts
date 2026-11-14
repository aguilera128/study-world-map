import { useEffect } from 'react';
import { create } from 'zustand';
import type { MapEngine, SatelliteOrbits, SatelliteSet } from '../engine/MapEngine';
import { fitsOnMap, isSatRow, launchYear, MAX_ORBIT_RADII, SAT_COLORS, SAT_GROUPS, SAT_REFRESH_HOURS, type SatGroup, type SatRow } from '../satellites/format';
import type { SatNow } from '../satellites/orbit';

// Los satélites de ahora, del lado de la aplicación: pide los elementos orbitales a nuestra propia
// función (/api/satelites, que es quien habla con CelesTrak), carga satellite.js solo entonces y le
// pasa al motor cómo calcular dónde está cada uno. Solo se piden los grupos encendidos, y se
// renuevan cada seis horas mientras sigan así.

const REFRESH = SAT_REFRESH_HOURS * 3600_000;
/**
 * Cada cuánto se vuelven a trazar las órbitas. Entre tanto el motor solo las gira con la Tierra; lo
 * que se desvía el satélite de su línea en ese rato (el plano de la órbita de la ISS gira unos 5° al
 * día) se queda en pocos kilómetros.
 */
const ORBIT_REFRESH = 10 * 60_000;
/** Tamaño del icono de cada grupo, en píxeles CSS (de lejos, algo menos). Starlink va como un punto: son miles. */
const SIZES: Record<SatGroup, number> = { estaciones: 18, navegacion: 14, meteorologicos: 14, starlink: 3 };
/** Las estaciones que llevan rótulo, por su nombre en CelesTrak. */
export const STATIONS = { 'ISS (ZARYA)': 'iss', 'CSS (TIANHE)': 'tiangong' } as const;
export type StationId = (typeof STATIONS)[keyof typeof STATIONS];

interface SatInfo {
  /** Cuándo se pidieron a CelesTrak los elementos más antiguos de lo que se ve (ISO 8601), o null si aún no hay nada. */
  fetched: string | null;
  /** Cuántos se dibujan de cada grupo. */
  counts: Partial<Record<SatGroup, number>>;
  /** Cuántos de los pedidos no se dibujan por estar demasiado lejos (geoestacionarios). */
  beyond: number;
  failed: boolean;
}

/** De cuándo son y cuántos son los satélites que se ven. Lo lee la leyenda de las capas. */
export const useSatelliteInfo = create<SatInfo>(() => ({ fetched: null, counts: {}, beyond: 0, failed: false }));

/** Dónde están ahora las estaciones con rótulo (grados y radios sobre la superficie). */
export const useStations = create<Partial<Record<StationId, { lon: number; lat: number; alt: number }>>>(() => ({}));

/** Lo que dice la ficha de un satélite: lo que trae CelesTrak y lo calculado para ahora. */
export interface SatCard {
  name: string;
  group: SatGroup;
  norad: number;
  launchYear: number | null;
  now: SatNow;
  /**
   * Dónde lo dibuja el motor (grados y radios sobre la esfera, como los rótulos de las estaciones), y
   * ahí va la ficha. No es lo de `now`, que va sobre el elipsoide: de un sitio al otro hay píxeles.
   */
  at: { lon: number; lat: number; alt: number };
}

/** Los satélites que se ven, para su ficha: los datos de cada uno y su órbita (por su índice en el motor). */
export interface SatCatalog {
  card(index: number, date: Date): SatCard | null;
  orbit(index: number, date: Date): Float32Array | null;
}
export const useSatCatalog = create<{ catalog: SatCatalog | null }>(() => ({ catalog: null }));

/** Lo ya pedido en esta visita, por grupo: la red de Vercel lo guarda seis horas, así que no se repite antes. */
const loaded = new Map<SatGroup, { at: number; fetched: string; rows: SatRow[] }>();

async function loadGroup(group: SatGroup): Promise<{ fetched: string; rows: SatRow[] }> {
  const known = loaded.get(group);
  if (known && Date.now() - known.at < REFRESH) return known;
  const res = await fetch(`/api/satelites?grupo=${group}`);
  if (!res.ok) throw new Error(`Sin satélites (${res.status}).`);
  const body = (await res.json()) as { fetched?: unknown; sats?: unknown };
  if (typeof body.fetched !== 'string' || !Array.isArray(body.sats)) throw new Error('Respuesta de satélites no válida.');
  const data = { at: Date.now(), fetched: body.fetched, rows: body.sats.filter(isSatRow) };
  loaded.set(group, data);
  return data;
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

/** Prepara para el motor los satélites de los grupos encendidos. */
async function build(groups: SatGroup[]): Promise<{ set: SatelliteSet; info: SatInfo; orbits: () => SatelliteOrbits; catalog: SatCatalog }> {
  const [orbit, ...lists] = await Promise.all([import('../satellites/orbit'), ...groups.map(loadGroup)]);
  // Un satélite puede estar en dos grupos (un meteorológico también es geoestacionario): cuenta en el primero.
  const seen = new Set<number>();
  const chosen: { group: SatGroup; rec: NonNullable<ReturnType<typeof orbit.satrecOf>>; row: SatRow }[] = [];
  const counts: Partial<Record<SatGroup, number>> = {};
  let beyond = 0;
  groups.forEach((group, k) => {
    for (const row of lists[k].rows) {
      if (seen.has(row[1])) continue;
      seen.add(row[1]);
      if (!fitsOnMap(row)) {
        beyond++;
        continue;
      }
      const rec = orbit.satrecOf(row);
      if (!rec) continue;
      chosen.push({ group, rec, row });
      counts[group] = (counts[group] ?? 0) + 1;
    }
  });
  // Se dibujan en orden inverso: los primeros grupos (las estaciones) quedan encima.
  chosen.reverse();
  const colors = new Float32Array(chosen.length * 3);
  const sizes = new Float32Array(chosen.length);
  const kinds = new Float32Array(chosen.length);
  const stations = new Map<StationId, number>();
  chosen.forEach((s, i) => {
    colors.set(rgb(SAT_COLORS[s.group]), i * 3);
    sizes[i] = SIZES[s.group];
    kinds[i] = SAT_GROUPS.indexOf(s.group);
    const station = STATIONS[s.row[0] as keyof typeof STATIONS];
    if (station) stations.set(station, i);
  });
  const set: SatelliteSet = {
    count: chosen.length,
    colors,
    sizes,
    kinds,
    reach: MAX_ORBIT_RADII,
    angle: (date) => -orbit.siderealTime(date),
    update(date, positions, from, to) {
      const gmst = orbit.siderealTime(date);
      for (let i = from; i < to; i++) orbit.positionAt(chosen[i].rec, date, gmst, positions, i * 3);
      // Las estaciones, para sus rótulos: se miran cuando les llega el turno, y el rótulo se mueve
      // cuando la estación ha avanzado algo (una décima de grado, más o menos cada segundo y medio).
      const moved: ReturnType<typeof useStations.getState> = {};
      const before = useStations.getState();
      for (const [id, i] of stations) {
        if (i < from || i >= to) continue;
        const now = orbit.geoOf(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        const last = before[id];
        if (!last || Math.abs(now.lat - last.lat) + Math.abs(now.lon - last.lon) > 0.1) moved[id] = now;
      }
      if (Object.keys(moved).length) useStations.setState(moved);
    },
  };
  const fetched = lists.map((l) => l.fetched).sort()[0] ?? null;

  /**
   * Una vuelta de cada órbita, trazada desde ahora. Starlink no (serían 11 000 líneas). Una órbita
   * que ya está dibujada no se repite: la de los vehículos acoplados a una estación (van en el mismo
   * sitio) ni la de los que comparten plano y altura (los GPS van de cinco en cinco por plano).
   */
  const orbits = (): SatelliteOrbits => {
    const now = new Date();
    const deg = (rad: number) => Math.round((rad * 180) / Math.PI / 0.1);
    const seenOrbit = new Set<string>();
    const here = new Float32Array(3);
    const gmst = orbit.siderealTime(now);
    const paths: { path: Float32Array; color: number[] }[] = [];
    for (const s of chosen) {
      if (s.group === 'starlink') continue;
      if (!orbit.positionAt(s.rec, now, gmst, here)) continue;
      const near = `p${Math.round(here[0] * 300)},${Math.round(here[1] * 300)},${Math.round(here[2] * 300)}`;
      const plane = `o${deg(s.rec.inclo)},${deg(s.rec.nodeo)},${Math.round(s.rec.no * 1e3)}`;
      if (seenOrbit.has(near) || seenOrbit.has(plane)) continue;
      const path = orbit.orbitPath(s.rec, now);
      if (!path) continue;
      seenOrbit.add(near).add(plane);
      paths.push({ path, color: rgb(SAT_COLORS[s.group]) });
    }
    // Dos vértices por tramo: todas en una sola geometría.
    const segments = paths.reduce((n, p) => n + p.path.length / 3 - 1, 0);
    const positions = new Float32Array(segments * 6);
    const colors = new Float32Array(segments * 6);
    let at = 0;
    for (const { path, color } of paths) {
      for (let k = 0; k + 3 < path.length; k += 3) {
        positions.set(path.subarray(k, k + 6), at);
        colors.set(color, at);
        colors.set(color, at + 3);
        at += 6;
      }
    }
    return { positions, colors };
  };
  const catalog: SatCatalog = {
    card(index, date) {
      const s = chosen[index];
      const now = s && orbit.satNow(s.rec, date);
      const here = [0, 0, 0];
      if (!now || !orbit.positionAt(s.rec, date, orbit.siderealTime(date), here)) return null;
      return { name: s.row[0], group: s.group, norad: s.row[1], launchYear: launchYear(s.row[12]), now, at: orbit.geoOf(here[0], here[1], here[2]) };
    },
    orbit: (index, date) => (chosen[index] ? orbit.orbitPath(chosen[index].rec, date) : null),
  };
  return { set, info: { fetched, counts, beyond, failed: false }, orbits, catalog };
}

/** Mantiene los satélites en el motor: los de los grupos encendidos, con sus datos al día. */
export function useSatellites(engine: MapEngine | null, on: boolean, satGroups: Record<SatGroup, boolean>, showOrbits: boolean) {
  const groups = on ? SAT_GROUPS.filter((g) => satGroups[g]) : [];
  const key = groups.join(',');

  useEffect(() => {
    if (!engine) return;
    const wanted = key ? (key.split(',') as SatGroup[]) : [];
    let current = true;
    const noStations = { iss: undefined, tiangong: undefined };
    if (!wanted.length) {
      engine.setSatellites(null);
      engine.setSatelliteOrbits(null);
      useSatCatalog.setState({ catalog: null });
      useStations.setState(noStations);
      useSatelliteInfo.setState({ fetched: null, counts: {}, beyond: 0, failed: false });
      return;
    }
    // Al cambiar de grupos, lo de antes se sigue viendo hasta que está lo nuevo.
    let trace: (() => SatelliteOrbits) | null = null;
    const run = () =>
      build(wanted).then(
        ({ set, info, orbits, catalog }) => {
          if (!current) return;
          useStations.setState(noStations);
          engine.setSatellites(set);
          useSatCatalog.setState({ catalog });
          trace = showOrbits ? orbits : null;
          engine.setSatelliteOrbits(trace?.() ?? null);
          useSatelliteInfo.setState(info);
        },
        () => current && useSatelliteInfo.setState({ failed: true }),
      );
    void run();
    const timer = window.setInterval(run, REFRESH);
    const retrace = window.setInterval(() => trace && engine.setSatelliteOrbits(trace()), ORBIT_REFRESH);
    return () => {
      current = false;
      window.clearInterval(timer);
      window.clearInterval(retrace);
    };
  }, [engine, key, showOrbits]);
}
