import type { Atlas } from '../atlas/atlas';
import type { Bounds, RegionKey } from '../atlas/types';

/** Qué se aprende: cada reto entrena una destreza distinta y lleva su propio progreso. */
export type ModeId = 'locate' | 'continent' | 'name' | 'capital' | 'flag';

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
    title: 'Localizar',
    summary: 'Te damos el nombre de un país y lo buscas en el mapa.',
    answers: ['map'],
  },
  {
    id: 'continent',
    title: 'Continentes',
    summary: 'Di en qué continente está cada país.',
    answers: ['choice', 'guided'],
  },
  {
    id: 'name',
    title: 'Nombrar',
    summary: 'Señalamos un país en el mapa y dices cuál es.',
    answers: ['choice', 'type'],
  },
  {
    id: 'capital',
    title: 'Capitales',
    summary: 'Une cada país con su capital.',
    answers: ['choice', 'map', 'type'],
  },
  {
    id: 'flag',
    title: 'Banderas',
    summary: 'Reconoce de qué país es cada bandera.',
    answers: ['map', 'choice'],
  },
];

export const modeDef = (id: ModeId): ModeDef => MODES.find((m) => m.id === id)!;

export function answerLabel(mode: ModeId, answer: AnswerKind): string {
  if (mode === 'continent') return answer === 'guided' ? 'Viéndolo en el mapa' : 'Solo con el nombre';
  if (mode === 'capital' && answer === 'map') return 'Buscando el país';
  return { map: 'En el mapa', choice: 'Con opciones', guided: 'Con el mapa', type: 'Escribiendo' }[answer];
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

export interface RegionFilterDef {
  id: string;
  label: string;
  /** Regiones del atlas que agrupa; vacío = todas. */
  keys: RegionKey[];
  /** Encuadre de cámara; si falta se usa el de la región del atlas (o la vista general). */
  frame?: Bounds;
}

export const REGION_FILTERS: RegionFilterDef[] = [
  { id: 'mundo', label: 'Mundo', keys: [] },
  { id: 'europa', label: 'Europa', keys: ['europa'] },
  { id: 'asia', label: 'Asia', keys: ['asia'] },
  { id: 'africa', label: 'África', keys: ['africa'] },
  { id: 'america', label: 'América', keys: ['am-norte', 'am-central', 'am-caribe', 'am-sur'], frame: [-125, -56, -35, 62] },
  { id: 'america-nc', label: 'Norte y Centroamérica', keys: ['am-norte', 'am-central', 'am-caribe'], frame: [-128, 6, -58, 58] },
  { id: 'america-sur', label: 'Sudamérica', keys: ['am-sur'] },
  { id: 'oceania', label: 'Oceanía', keys: ['oceania'] },
];

/** Lista de estudio: una selección de países (por id ISO) para preparar un examen concreto. */
export interface StudyList {
  id: string;
  name: string;
  countries: string[];
}

/** Lista de ejemplo que viene de serie: los 50 países que suelen pedirse «por importancia». */
export const SAMPLE_LIST: StudyList = {
  id: 'lista-50-principales',
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
  const list = lists.find((l) => l.id === id);
  if (list) {
    const countries = list.countries.map((c) => atlas.indexOf(c)).filter((i) => i >= 0 && atlas.countries[i].kind === 'country');
    return { id, label: list.name, countries, frame: null, isList: true };
  }
  const def = REGION_FILTERS.find((r) => r.id === id) ?? REGION_FILTERS[0];
  const countries = def.keys.length
    ? atlas.quizzable.filter((i) => atlas.countries[i].regions.some((r) => def.keys.includes(r)))
    : atlas.quizzable;
  const frame = def.frame ?? (def.keys.length === 1 ? atlas.regions[def.keys[0]].frame : null);
  return { id: def.id, label: def.label, countries, frame, isList: false };
}

export const DEFAULT_CONFIG: GameConfig = { mode: 'locate', answer: 'map', scope: 'europa', length: 10 };

/** Corrige una configuración guardada que ya no sea válida (un reto retirado, una lista borrada…). */
export function sanitizeConfig(config: Partial<GameConfig> | undefined, lists: StudyList[]): GameConfig {
  const mode = MODES.find((m) => m.id === config?.mode) ?? MODES[0];
  const answer = mode.answers.includes(config?.answer as AnswerKind) ? (config!.answer as AnswerKind) : mode.answers[0];
  const known = REGION_FILTERS.some((r) => r.id === config?.scope) || lists.some((l) => l.id === config?.scope);
  const length = config?.length === 10 || config?.length === 20 || config?.length === 'all' ? config.length : DEFAULT_CONFIG.length;
  return { mode: mode.id, answer, scope: known ? config!.scope! : DEFAULT_CONFIG.scope, length };
}
