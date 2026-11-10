import type { ModeId } from './config';
import { t } from '../i18n';

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

export const MAX_BOX = 5;

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

const MODE_IDS: readonly ModeId[] = ['locate', 'continent', 'name', 'capital', 'flag', 'climate', 'region'];
const ENTITY_ID = /^([A-Z]{3}|[A-Z]{2}-[A-Z0-9]{1,3})$/;
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

/**
 * Limpia un progreso leído del navegador: descarta lo que no tenga la forma esperada (datos de otra
 * versión, almacenamiento corrupto) en lugar de dejar que rompa la partida.
 */
export function sanitizeProgress(raw: unknown): Progress {
  const out: Progress = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [country, modes] of Object.entries(raw)) {
    if (!ENTITY_ID.test(country) || !modes || typeof modes !== 'object') continue;
    const clean: Partial<Record<ModeId, SkillStats>> = {};
    for (const mode of MODE_IDS) {
      const s = (modes as Record<string, Partial<SkillStats> | undefined>)[mode];
      if (!s || !isCount(s.box) || !isCount(s.seen) || !isCount(s.right) || !isCount(s.last)) continue;
      clean[mode] = { box: Math.min(MAX_BOX, Math.max(1, Math.round(s.box))), seen: s.seen, right: s.right, last: s.last };
    }
    if (Object.keys(clean).length) out[country] = clean;
  }
  return out;
}

const DAY = 86_400_000;
const BOX_WEIGHT = [4, 6, 4, 2, 1.2, 0.6];

/** Peso con el que un país entra en el sorteo de preguntas: más alto cuanto peor se sabe. */
export function selectionWeight(progress: Progress, country: string, mode: ModeId, now: number): number {
  const stats = progress[country]?.[mode];
  if (!stats) return BOX_WEIGHT[0];
  let weight = BOX_WEIGHT[Math.min(MAX_BOX, Math.max(1, stats.box))];
  // Lo que se sabía pero lleva tiempo sin repasarse vuelve a ganar peso.
  if (stats.box >= 3 && now - stats.last > 10 * DAY) weight *= 1.8;
  return weight;
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
