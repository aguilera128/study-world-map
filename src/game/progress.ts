import type { ModeId } from './config';
import { t } from '../i18n';
import { MAX_BOX } from './progressData';

// Progreso entre partidas. Cada país lleva, por reto, una "caja" de Leitner (1–5): los aciertos
// a la primera lo suben de caja y los fallos lo devuelven a la primera. Las cajas bajas se
// preguntan más a menudo; así el tiempo de estudio se va a lo que todavía no se sabe.

/** Cómo se resolvió una pregunta: a la primera, tras algún fallo, o sin acertar. */
export type Outcome = 'first' | 'later' | 'failed';

export interface SkillStats {
  /** Caja de Leitner, de 1 (recién fallado) a 5 (dominado). */
  box: number;
  seen: number;
  /** Veces acertado a la primera. */
  right: number;
  /** Última vez que se preguntó (ms desde la época Unix). */
  last: number;
}

/** id del país (ISO3) o de la provincia (ISO 3166-2, «ES-A») → reto → estadísticas. Los dos mapas no se pisan. */
export type Progress = Record<string, Partial<Record<ModeId, SkillStats>>>;

// La validación de lo guardado la comparte el servidor, que no puede cargar este fichero (importa ../i18n).
export { MAX_BOX, sanitizeProgress } from './progressData';

/** Devuelve un progreso nuevo con el resultado anotado (no modifica el original). */
export function record(progress: Progress, country: string, mode: ModeId, outcome: Outcome, now: number): Progress {
  const previous = progress[country]?.[mode];
  let box: number;
  if (outcome === 'first') {
    // Acertar a la primera un país nunca visto indica que ya se sabía: empieza a medio camino.
    box = previous ? Math.min(MAX_BOX, previous.box + 1) : 3;
  } else if (outcome === 'later') {
    box = previous ? Math.max(1, previous.box - 1) : 1;
  } else {
    box = 1;
  }
  const stats: SkillStats = {
    box,
    seen: (previous?.seen ?? 0) + 1,
    right: (previous?.right ?? 0) + (outcome === 'first' ? 1 : 0),
    last: now,
  };
  return { ...progress, [country]: { ...progress[country], [mode]: stats } };
}

/**
 * Junta dos progresos (el de este dispositivo y el de otro): de cada país y reto se queda la ficha
 * más reciente y, si son del mismo momento, la que más veces se ha preguntado.
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const out: Progress = { ...a };
  for (const [country, modes] of Object.entries(b)) {
    const merged = { ...out[country] };
    for (const [mode, theirs] of Object.entries(modes) as [ModeId, SkillStats][]) {
      const ours = merged[mode];
      if (!ours || theirs.last > ours.last || (theirs.last === ours.last && theirs.seen > ours.seen)) merged[mode] = theirs;
    }
    out[country] = merged;
  }
  return out;
}

const DAY = 86_400_000;
const BOX_WEIGHT = [4, 6, 4, 2, 1.2, 0.6];
/** Días que tiene que pasar cada caja sin preguntarse para que «toque» repasarla (índice = caja). */
const REVIEW_DAYS = [0, 0, 1, 3, 7, 21];
/** Peso de lo que aún no toca: lo recién acertado se aparta un poco para no repetirlo enseguida. */
const NOT_DUE = 0.6;

/**
 * Peso con el que un país entra en el sorteo de preguntas: más alto cuanto peor se sabe y cuanto
 * más tiempo lleva sin repasarse respecto a lo que le toca por su caja (repetición espaciada).
 *
 * Una vez vencido el intervalo, el peso sube en línea recta desde el de su caja hasta el de algo
 * nunca visto (4), y llega a él cuando el retraso es el doble del intervalo: así algo dominado y muy
 * olvidado vuelve a pesar como algo a medias, pero nunca más que algo nunca visto ni que algo
 * fallado (6). La caja 1 no depende del tiempo.
 */
export function selectionWeight(progress: Progress, country: string, mode: ModeId, now: number): number {
  const stats = progress[country]?.[mode];
  if (!stats) return BOX_WEIGHT[0];
  const box = Math.min(MAX_BOX, Math.max(1, Math.round(stats.box) || 1));
  const base = BOX_WEIGHT[box];
  if (box === 1) return base;
  // Una fecha en el futuro (reloj cambiado) o un valor no numérico cuentan como «recién preguntado».
  const elapsed = (now - stats.last) / DAY;
  const days = Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
  const interval = REVIEW_DAYS[box];
  if (days < interval) return base * NOT_DUE;
  const overdue = Math.min((days - interval) / (2 * interval), 1);
  return base + (BOX_WEIGHT[0] - base) * overdue;
}

/** Nivel de dominio para pintar el mapa de progreso: 0 sin ver · 1 aprendiendo · 2 · 3 · 4 dominado. */
export type Mastery = 0 | 1 | 2 | 3 | 4;

export const MASTERY_LABELS = ['Sin practicar', 'Aprendiendo', 'A medias', 'Casi', 'Dominado'].map((label) => t(label));

export function mastery(stats: SkillStats | undefined): Mastery {
  if (!stats) return 0;
  if (stats.box <= 1) return 1;
  if (stats.box === 2) return 2;
  if (stats.box < MAX_BOX) return 3;
  return 4;
}

export interface ProgressSummary {
  total: number;
  /** Países en cada nivel de dominio (índices 0–4). */
  levels: [number, number, number, number, number];
  seen: number;
  mastered: number;
  /** Avance global de 0 a 1: cada país aporta según su caja. */
  ratio: number;
}

export function summarize(progress: Progress, countries: string[], mode: ModeId): ProgressSummary {
  const levels: ProgressSummary['levels'] = [0, 0, 0, 0, 0];
  let boxes = 0;
  for (const id of countries) {
    const stats = progress[id]?.[mode];
    levels[mastery(stats)]++;
    boxes += stats ? stats.box : 0;
  }
  const total = countries.length;
  return {
    total,
    levels,
    seen: total - levels[0],
    mastered: levels[4],
    ratio: total ? boxes / (total * MAX_BOX) : 0,
  };
}
