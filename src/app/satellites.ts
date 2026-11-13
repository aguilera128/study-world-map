import { useEffect } from 'react';
import { create } from 'zustand';
import type { MapEngine, SatelliteSet } from '../engine/MapEngine';
import { fitsOnMap, isSatRow, MAX_ORBIT_RADII, SAT_COLORS, SAT_GROUPS, SAT_REFRESH_HOURS, type SatGroup, type SatRow } from '../satellites/format';

// Los satélites de ahora, del lado de la aplicación: pide los elementos orbitales a nuestra propia
// función (/api/satelites, que es quien habla con CelesTrak), carga satellite.js solo entonces y le
// pasa al motor cómo calcular dónde está cada uno. Solo se piden los grupos encendidos, y se
// renuevan cada seis horas mientras sigan así.

const REFRESH = SAT_REFRESH_HOURS * 3600_000;
/** Tamaño del punto de cada grupo, en píxeles CSS. */
const SIZES: Record<SatGroup, number> = { estaciones: 6, navegacion: 4.5, meteorologicos: 4, starlink: 2.2 };
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
async function build(groups: SatGroup[]): Promise<{ set: SatelliteSet; info: SatInfo }> {
  const [orbit, ...lists] = await Promise.all([import('../satellites/orbit'), ...groups.map(loadGroup)]);
  // Un satélite puede estar en dos grupos (un meteorológico también es geoestacionario): cuenta en el primero.
  const seen = new Set<number>();
  const chosen: { group: SatGroup; rec: NonNullable<ReturnType<typeof orbit.satrecOf>>; name: string }[] = [];
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
      chosen.push({ group, rec, name: row[0] });
      counts[group] = (counts[group] ?? 0) + 1;
    }
  });
  // Se dibujan en orden inverso: los primeros grupos (las estaciones) quedan encima.
  chosen.reverse();
  const colors = new Float32Array(chosen.length * 3);
  const sizes = new Float32Array(chosen.length);
  const stations = new Map<StationId, number>();
  chosen.forEach((s, i) => {
    colors.set(rgb(SAT_COLORS[s.group]), i * 3);
    sizes[i] = SIZES[s.group];
    const station = STATIONS[s.name as keyof typeof STATIONS];
    if (station) stations.set(station, i);
  });
  const set: SatelliteSet = {
    count: chosen.length,
    colors,
    sizes,
    reach: MAX_ORBIT_RADII,
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
  return { set, info: { fetched, counts, beyond, failed: false } };
}

/** Mantiene los satélites en el motor: los de los grupos encendidos, con sus datos al día. */
export function useSatellites(engine: MapEngine | null, on: boolean, satGroups: Record<SatGroup, boolean>) {
  const groups = on ? SAT_GROUPS.filter((g) => satGroups[g]) : [];
  const key = groups.join(',');

  useEffect(() => {
    if (!engine) return;
    const wanted = key ? (key.split(',') as SatGroup[]) : [];
    let current = true;
    const noStations = { iss: undefined, tiangong: undefined };
    if (!wanted.length) {
      engine.setSatellites(null);
      useStations.setState(noStations);
      useSatelliteInfo.setState({ fetched: null, counts: {}, beyond: 0, failed: false });
      return;
    }
    // Al cambiar de grupos, lo de antes se sigue viendo hasta que está lo nuevo.
    const run = () =>
      build(wanted).then(
        ({ set, info }) => {
          if (!current) return;
          useStations.setState(noStations);
          engine.setSatellites(set);
          useSatelliteInfo.setState(info);
        },
        () => current && useSatelliteInfo.setState({ failed: true }),
      );
    void run();
    const timer = window.setInterval(run, REFRESH);
    return () => {
      current = false;
      window.clearInterval(timer);
    };
  }, [engine, key]);
}
