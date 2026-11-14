import type { ModeId } from './config';
import type { DailyRecord } from './daily';
import type { Progress, SkillStats } from './progress';

// Validación de lo que se guarda del progreso, que llega de fuentes que no son de fiar (el navegador,
// otro dispositivo, cualquiera que llame a la función). La usan la aplicación (./progress.ts) y la
// función de sincronización (api/sync.ts): no puede importar nada que se ejecute, solo tipos.

export const MAX_BOX = 5;

const MODE_IDS: readonly ModeId[] = ['locate', 'continent', 'name', 'capital', 'flag', 'climate', 'region', 'coords', 'population', 'inhabitants'];
/** País (ISO3), subdivisión (ISO 3166-2, «ES-A») o lugar del mapa de geografía física («lago-baikal», «pico-k2»). */
const ENTITY_ID = /^([A-Z]{3}|[A-Z]{2}-[A-Z0-9]{1,3}|[a-z]+(-[a-z0-9]+)+)$/;
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

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

/** Clave de una marca: reto/forma de responder/zona o lista/preguntas (`bestKey` en src/app/store.ts). */
const BEST_KEY = new RegExp(`^(${MODE_IDS.join('|')})/(map|choice|guided|type)/[a-z0-9]+(-[a-z0-9]+)*/(10|20|all)$`);

/** Lo que sube la sincronización (`local` en src/app/sync.ts). */
export interface SyncData {
  progress: Progress;
  bests: Record<string, { grade: number; ms: number; at: number }>;
  daily: DailyRecord | null;
}

/** Reduce lo que llega a la forma de `SyncData`: lo demás se descarta, no se guarda. */
export function cleanSyncData(raw: unknown): SyncData {
  const saved = (raw && typeof raw === 'object' ? raw : {}) as { progress?: unknown; bests?: unknown; daily?: unknown };
  const bests: SyncData['bests'] = {};
  if (saved.bests && typeof saved.bests === 'object') {
    for (const [key, b] of Object.entries(saved.bests as Record<string, Record<string, unknown> | null>)) {
      if (BEST_KEY.test(key) && b && isNumber(b.grade) && isNumber(b.ms) && isNumber(b.at)) bests[key] = { grade: b.grade, ms: b.ms, at: b.at };
    }
  }
  const d = saved.daily as Record<string, unknown> | null | undefined;
  const daily =
    d && typeof d.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.date) && isNumber(d.grade) && Number.isInteger(d.streak) && (d.streak as number) > 0
      ? { date: d.date, grade: d.grade, streak: d.streak as number }
      : null;
  return { progress: sanitizeProgress(saved.progress), bests, daily };
}
