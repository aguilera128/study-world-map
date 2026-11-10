import type { Atlas } from '../atlas/atlas';
import type { Bounds, MapId } from '../atlas/types';
import { isMapId, MAPS, type RegionFilterDef } from './maps';
import { t } from '../i18n';

export type { RegionFilterDef };

/**
 * Qué se aprende: cada reto entrena una destreza distinta y lleva su propio progreso. `region` es
 * el equivalente a `continent` en el mapa de un país: a qué comunidad autónoma pertenece una provincia.
 */
export type ModeId = 'locate' | 'continent' | 'name' | 'capital' | 'flag' | 'climate' | 'region' | 'coords' | 'population' | 'inhabitants';

/**
 * Variante del reto: cómo se responde.
 *   map     pulsando el país en el mapa
 *   choice  eligiendo entre opciones
 *   guided  eligiendo entre opciones con el país señalado en el mapa (más fácil)
 *   type    escribiendo la respuesta
 */
export type AnswerKind = 'map' | 'choice' | 'guided' | 'type';

/** Control con el que se introduce la respuesta. */
export type InputKind = 'map' | 'choice' | 'type';

export const inputOf = (answer: AnswerKind): InputKind => (answer === 'guided' ? 'choice' : answer);

export type SessionLength = 10 | 20 | 'all';

export interface GameConfig {
  /** Qué mapa se estudia: de él dependen los retos y las zonas que se pueden elegir. */
  map: MapId;
  mode: ModeId;
  answer: AnswerKind;
  /** Qué países entran: un filtro de región (`REGION_FILTERS`) o una lista de estudio. */
  scope: string;
  length: SessionLength;
}

export interface ModeDef {
  id: ModeId;
  title: string;
  /** Explicación de una línea para la pantalla de inicio. */
  summary: string;
  /** Variantes disponibles; la primera es la habitual. */
  answers: AnswerKind[];
}

export const MODES: ModeDef[] = [
  {
    id: 'locate',
    title: t('Localizar'),
    summary: t('Te damos el nombre de un país y lo buscas en el mapa.'),
    answers: ['map'],
  },
  {
    id: 'continent',
    title: t('Continentes'),
    summary: t('Di en qué continente está cada país.'),
    answers: ['choice', 'guided'],
  },
  {
    id: 'name',
    title: t('Nombrar'),
    summary: t('Señalamos un país en el mapa y dices cuál es.'),
    answers: ['choice', 'type'],
  },
  {
    id: 'capital',
    title: t('Capitales'),
    summary: t('Une cada país con su capital.'),
    answers: ['choice', 'map', 'type'],
  },
  {
    id: 'flag',
    title: t('Banderas'),
    summary: t('Reconoce de qué país es cada bandera.'),
    answers: ['map', 'choice'],
  },
  {
    id: 'climate',
    title: t('Climas'),
    summary: t('Di qué clima tiene cada país.'),
    answers: ['choice', 'guided'],
  },
  {
    id: 'population',
    title: t('Población'),
    summary: t('Di si la densidad de población de cada país es alta, media o baja.'),
    answers: ['choice', 'guided'],
  },
  {
    // Comparar países por su número de habitantes: no hay cortes que aprender, solo cuál es mayor.
    id: 'inhabitants',
    title: t('Habitantes'),
    summary: t('De cuatro países, di cuál tiene más habitantes.'),
    answers: ['choice'],
  },
  {
    // Leer latitud y longitud: se da un punto por sus coordenadas y hay que decir qué país hay ahí.
    id: 'coords',
    title: t('Coordenadas'),
    summary: t('Te damos una latitud y una longitud y dices qué país hay ahí.'),
    answers: ['map', 'choice'],
  },
  {
    // Solo en el mapa de un país; su título y su resumen los pone cada mapa (./maps.ts).
    id: 'region',
    title: t('Región'),
    summary: '',
    answers: ['choice', 'guided'],
  },
];

/** Un reto tal como se llama y se explica en un mapa. */
export function modeDef(id: ModeId, map: MapId = 'world'): ModeDef {
  return { ...MODES.find((m) => m.id === id)!, ...MAPS[map].text.modes[id] };
}

/** Los retos que ofrece un mapa, en su orden. */
export const modesOf = (map: MapId): ModeDef[] => MAPS[map].modes.map((id) => modeDef(id, map));

export function answerLabel(mode: ModeId, answer: AnswerKind, map: MapId = 'world'): string {
  if (mode === 'continent' || mode === 'climate' || mode === 'region' || mode === 'population') return answer === 'guided' ? t('Viéndolo en el mapa') : t('Solo con el nombre');
  if (mode === 'capital' && answer === 'map') return MAPS[map].text.findOwner;
  return { map: t('En el mapa'), choice: t('Con opciones'), guided: t('Con el mapa'), type: t('Escribiendo') }[answer];
}

/** Intentos antes de dar la solución, según cómo se responde. */
export const MAX_ATTEMPTS: Record<InputKind, number> = { map: 3, choice: 2, type: 3 };

/** ¿Se señala el país en el mapa mientras se pregunta? (Si no, hay que encontrarlo o recordarlo.) */
export function showsTarget(config: Pick<GameConfig, 'mode' | 'answer'>): boolean {
  if (config.mode === 'name') return true;
  if (config.mode === 'capital') return config.answer !== 'map';
  return config.answer === 'guided';
}

// ───────────────────────── Ámbito: regiones y listas de estudio ─────────────────────────

/** Las zonas del mapa del mundo. Las de cada mapa están en ./maps.ts. */
export const REGION_FILTERS: RegionFilterDef[] = MAPS.world.filters;

/** Nombre de una zona: el suyo o, si agrupa una sola región, el de esta en el atlas. */
export const filterLabel = (atlas: Atlas, def: RegionFilterDef): string => def.label ?? atlas.regions[def.keys[0]].name;

/** Lista de estudio: una selección de países (por id ISO) para preparar un examen concreto. */
export interface StudyList {
  id: string;
  name: string;
  countries: string[];
}

/** Lista de ejemplo que viene de serie: los 50 países que suelen pedirse «por importancia». */
export const SAMPLE_LIST: StudyList = {
  id: 'lista-50-principales',
  // En español: es lo que se guarda en el navegador. Se traduce al mostrarlo (ver resolveScope).
  name: '50 países principales',
  countries: (
    'DEU SAU DZA ARG AUS AUT BEL BRA CAN CHL CHN COL KOR EGY ARE ESP USA PHL FRA GRC IND IDN IRN IRQ ISR ' +
    'ITA JPN MYS MAR MEX NGA NOR NZL NLD PAK PER POL PRT GBR RUS SGP ZAF SWE CHE THA TWN TUR UKR VNM VEN'
  ).split(' '),
};

/** Países que entran en un cuestionario, ya resueltos contra el atlas. */
export interface Scope {
  id: string;
  label: string;
  countries: number[];
  /** Encuadre de cámara, o null para la vista general. */
  frame: Bounds | null;
  isList: boolean;
}

export function resolveScope(atlas: Atlas, id: string, lists: StudyList[]): Scope {
  const map = MAPS[atlas.map];
  const list = map.extras ? lists.find((l) => l.id === id) : undefined;
  if (list) {
    const countries = list.countries.map((c) => atlas.indexOf(c)).filter((i) => i >= 0 && atlas.countries[i].kind === 'country');
    // Una lista con nombre conocido (la de ejemplo) se enseña traducida; las del usuario, tal cual.
    return { id, label: t(list.name), countries, frame: null, isList: true };
  }
  const def = map.filters.find((r) => r.id === id) ?? map.filters[0];
  const countries = def.keys.length
    ? atlas.quizzable.filter((i) => atlas.countries[i].regions.some((r) => def.keys.includes(r)))
    : atlas.quizzable;
  // Sin encuadre propio: el de su región o, en el mapa de un país, el de sus regiones juntas. El
  // mapa entero se queda con la vista general (null en el mundo; el país en el mapa de un país).
  const union = (a: Bounds, b: Bounds): Bounds => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
  const framed = def.keys.length === 1 || (def.keys.length > 1 && atlas.frame !== null);
  const frame = def.frame ?? (framed ? def.keys.map((k) => atlas.regions[k].frame).reduce(union) : def.keys.length ? null : atlas.frame);
  return { id: def.id, label: filterLabel(atlas, def), countries, frame, isList: false };
}

export const DEFAULT_CONFIG: GameConfig = { map: 'world', mode: 'locate', answer: 'map', scope: MAPS.world.scope, length: 10 };

/**
 * Corrige una configuración que no sea válida: una guardada por otra versión (un reto retirado, una
 * lista borrada…) o la que queda al cambiar de mapa, cuyo reto o zona puede no existir en el nuevo.
 */
export function sanitizeConfig(config: Partial<GameConfig> | undefined, lists: StudyList[]): GameConfig {
  const map = MAPS[isMapId(config?.map) ? config.map : 'world'];
  const modes = modesOf(map.id);
  const mode = modes.find((m) => m.id === config?.mode) ?? modes[0];
  const answer = mode.answers.includes(config?.answer as AnswerKind) ? (config!.answer as AnswerKind) : mode.answers[0];
  const known = map.filters.some((r) => r.id === config?.scope) || (map.extras && lists.some((l) => l.id === config?.scope));
  const length = config?.length === 10 || config?.length === 20 || config?.length === 'all' ? config.length : DEFAULT_CONFIG.length;
  return { map: map.id, mode: mode.id, answer, scope: known ? config!.scope! : map.scope, length };
}
